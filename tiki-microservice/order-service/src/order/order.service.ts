import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Inject,
  Logger 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async createOrder(userId: number, dto: any) {
    const { address_id, items, payment_method, note } = dto;

    // Get address
    const address = await this.prisma.address.findFirst({
      where: { address_id, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException('Địa chỉ không tồn tại');
    }

    // Get cart items if not provided
    let orderItems = items || [];
    if (!items || items.length === 0) {
      const cartItems = await this.prisma.cart.findMany({
        where: { user_id: userId },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Giỏ hàng trống');
      }

      orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));
    }

    // Validate stock and get product details from Product Service
    const productDetails = await Promise.all(
      orderItems.map(async (item) => {
        try {
          // Check stock
          const stockCheck = await firstValueFrom(
            this.productClient
              .send({ cmd: 'check_stock' }, { 
                productId: item.product_id, 
                quantity: item.quantity 
              })
              .pipe(timeout(5000))
          );

          if (!stockCheck.available) {
            throw new BadRequestException(
              `Sản phẩm ID ${item.product_id} chỉ còn ${stockCheck.in_stock} trong kho`
            );
          }

          // Get product details
          const product = await firstValueFrom(
            this.productClient
              .send({ cmd: 'get_product_by_id' }, { id: item.product_id })
              .pipe(timeout(5000))
          );

          if (!product.success) {
            throw new NotFoundException(`Product ${item.product_id} not found`);
          }

          return {
            product_id: item.product_id,
            product_name: product.data.name,
            product_image: product.data.thumbnail,
            price: product.data.price,
            quantity: item.quantity,
          };
        } catch (error) {
          this.logger.error(`Error getting product ${item.product_id}:`, error);
          throw error;
        }
      }),
    );

    // Calculate prices
    const subtotal = productDetails.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );
    const shipping_fee = subtotal >= 300000 ? 0 : 30000;
    const total_amount = subtotal + shipping_fee;

    // Generate order code
    const order_code = await this.generateOrderCode();

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          order_code,
          user_id: userId,
          address_id,
          shipping_name: address.full_name,
          shipping_phone: address.phone,
          shipping_address: `${address.street}, ${address.ward}, ${address.district}, ${address.province}`,
          subtotal,
          shipping_fee,
          discount_amount: 0,
          total_amount,
          payment_method,
          note: note || '',
          status: 'pending',
          payment_status: 'pending',
        },
      });

      await tx.orderItem.createMany({
        data: productDetails.map((item) => ({
          order_id: newOrder.order_id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          price: item.price,
          quantity: item.quantity,
        })),
      });

      // Clear cart if ordered from cart
      if (!items || items.length === 0) {
        await tx.cart.deleteMany({ where: { user_id: userId } });
      }

      return newOrder;
    });

    this.logger.log(`Order created: ${order_code}`);

    return {
      success: true,
      message: 'Đặt hàng thành công',
      data: {
        order_id: order.order_id,
        order_code: order.order_code,
        total_amount: Number(order.total_amount),
        status: order.status,
        items: productDetails,
      },
    };
  }

  async getMyOrders(userId: number, query: any) {
    const { page = 1, limit = 10, status } = query;
    const skip = (page - 1) * limit;

    const where: any = { user_id: userId };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderDetail(userId: number, orderId: number) {
    const order = await this.prisma.order.findFirst({
      where: { order_id: orderId, user_id: userId },
      include: { items: true, address: true },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    return {
      success: true,
      data: order,
    };
  }

  async cancelOrder(userId: number, orderId: number, reason?: string) {
    const order = await this.prisma.order.findFirst({
      where: { order_id: orderId, user_id: userId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Đơn hàng không tồn tại');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new BadRequestException('Không thể hủy đơn hàng này');
    }

    await this.prisma.order.update({
      where: { order_id: orderId },
      data: {
        status: 'cancelled',
        note: reason ? `Lý do hủy: ${reason}` : order.note,
      },
    });

    this.logger.log(`Order cancelled: ${order.order_code}`);

    return {
      success: true,
      message: 'Hủy đơn hàng thành công',
    };
  }

  private async generateOrderCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    const count = await this.prisma.order.count();
    const sequence = String(count + 1).padStart(4, '0');

    return `TK${year}${month}${day}${sequence}`;
  }
}