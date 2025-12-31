import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
import { firstValueFrom, timeout } from 'rxjs';

@Injectable()
export class CartService {
  constructor(
    private prisma: PrismaService,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async getCart(userId: number) {
    const cartItems = await this.prisma.cart.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    // Get product details from Product Service
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const product = await firstValueFrom(
            this.productClient
              .send({ cmd: 'get_product_by_id' }, { id: item.product_id })
              .pipe(timeout(5000))
          );

          return {
            cart_id: item.cart_id,
            product_id: item.product_id,
            product_name: product.data.name,
            price: Number(product.data.price),
            quantity: item.quantity,
            thumbnail: product.data.thumbnail,
            quantity_in_stock: product.data.quantity_in_stock,
            subtotal: Number(product.data.price) * item.quantity,
          };
        } catch (error) {
          return null;
        }
      }),
    );

    const validItems = itemsWithDetails.filter(item => item !== null);
    const total_items = validItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = validItems.reduce((sum, item) => sum + item.subtotal, 0);
    const shipping_fee = subtotal >= 300000 ? 0 : 30000;
    const total = subtotal + shipping_fee;

    return {
      success: true,
      data: {
        items: validItems,
        total_items,
        subtotal,
        shipping_fee,
        total,
      },
    };
  }

  async addToCart(userId: number, dto: any) {
    const { product_id, quantity } = dto;

    // Check product exists and has stock
    const stockCheck = await firstValueFrom(
      this.productClient
        .send({ cmd: 'check_stock' }, { productId: product_id, quantity })
        .pipe(timeout(5000))
    );

    if (!stockCheck.available) {
      throw new BadRequestException(
        `Sản phẩm chỉ còn ${stockCheck.in_stock} trong kho`
      );
    }

    // Check if already in cart
    const existingCart = await this.prisma.cart.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id,
        },
      },
    });

    if (existingCart) {
      const newQuantity = existingCart.quantity + quantity;

      // Check stock again with new quantity
      const newStockCheck = await firstValueFrom(
        this.productClient
          .send({ cmd: 'check_stock' }, { productId: product_id, quantity: newQuantity })
          .pipe(timeout(5000))
      );

      if (!newStockCheck.available) {
        throw new BadRequestException(
          `Số lượng vượt quá tồn kho (còn ${newStockCheck.in_stock})`
        );
      }

      await this.prisma.cart.update({
        where: { cart_id: existingCart.cart_id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.cart.create({
        data: {
          user_id: userId,
          product_id,
          quantity,
        },
      });
    }

    return {
      success: true,
      message: 'Thêm vào giỏ hàng thành công',
    };
  }

  async updateCart(userId: number, cartId: number, dto: any) {
    const { quantity } = dto;

    const cartItem = await this.prisma.cart.findFirst({
      where: {
        cart_id: cartId,
        user_id: userId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    // Check stock
    const stockCheck = await firstValueFrom(
      this.productClient
        .send({ cmd: 'check_stock' }, { productId: cartItem.product_id, quantity })
        .pipe(timeout(5000))
    );

    if (!stockCheck.available) {
      throw new BadRequestException(
        `Sản phẩm chỉ còn ${stockCheck.in_stock} trong kho`
      );
    }

    await this.prisma.cart.update({
      where: { cart_id: cartId },
      data: { quantity },
    });

    return {
      success: true,
      message: 'Cập nhật giỏ hàng thành công',
    };
  }

  async removeFromCart(userId: number, cartId: number) {
    const cartItem = await this.prisma.cart.findFirst({
      where: {
        cart_id: cartId,
        user_id: userId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Sản phẩm không có trong giỏ hàng');
    }

    await this.prisma.cart.delete({
      where: { cart_id: cartId },
    });

    return {
      success: true,
      message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
    };
  }

  async clearCart(userId: number) {
    await this.prisma.cart.deleteMany({
      where: { user_id: userId },
    });

    return {
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng',
    };
  }
}