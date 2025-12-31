"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const prisma_service_1 = require("../prisma/prisma.service");
const rxjs_1 = require("rxjs");
let OrderService = OrderService_1 = class OrderService {
    prisma;
    productClient;
    logger = new common_1.Logger(OrderService_1.name);
    constructor(prisma, productClient) {
        this.prisma = prisma;
        this.productClient = productClient;
    }
    async createOrder(userId, dto) {
        const { address_id, items, payment_method, note } = dto;
        const address = await this.prisma.address.findFirst({
            where: { address_id, user_id: userId },
        });
        if (!address) {
            throw new common_1.NotFoundException('Địa chỉ không tồn tại');
        }
        let orderItems = items || [];
        if (!items || items.length === 0) {
            const cartItems = await this.prisma.cart.findMany({
                where: { user_id: userId },
            });
            if (cartItems.length === 0) {
                throw new common_1.BadRequestException('Giỏ hàng trống');
            }
            orderItems = cartItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
            }));
        }
        const productDetails = await Promise.all(orderItems.map(async (item) => {
            try {
                const stockCheck = await (0, rxjs_1.firstValueFrom)(this.productClient
                    .send({ cmd: 'check_stock' }, {
                    productId: item.product_id,
                    quantity: item.quantity
                })
                    .pipe((0, rxjs_1.timeout)(5000)));
                if (!stockCheck.available) {
                    throw new common_1.BadRequestException(`Sản phẩm ID ${item.product_id} chỉ còn ${stockCheck.in_stock} trong kho`);
                }
                const product = await (0, rxjs_1.firstValueFrom)(this.productClient
                    .send({ cmd: 'get_product_by_id' }, { id: item.product_id })
                    .pipe((0, rxjs_1.timeout)(5000)));
                if (!product.success) {
                    throw new common_1.NotFoundException(`Product ${item.product_id} not found`);
                }
                return {
                    product_id: item.product_id,
                    product_name: product.data.name,
                    product_image: product.data.thumbnail,
                    price: product.data.price,
                    quantity: item.quantity,
                };
            }
            catch (error) {
                this.logger.error(`Error getting product ${item.product_id}:`, error);
                throw error;
            }
        }));
        const subtotal = productDetails.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
        const shipping_fee = subtotal >= 300000 ? 0 : 30000;
        const total_amount = subtotal + shipping_fee;
        const order_code = await this.generateOrderCode();
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
    async getMyOrders(userId, query) {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;
        const where = { user_id: userId };
        if (status)
            where.status = status;
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
    async getOrderDetail(userId, orderId) {
        const order = await this.prisma.order.findFirst({
            where: { order_id: orderId, user_id: userId },
            include: { items: true, address: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        }
        return {
            success: true,
            data: order,
        };
    }
    async cancelOrder(userId, orderId, reason) {
        const order = await this.prisma.order.findFirst({
            where: { order_id: orderId, user_id: userId },
            include: { items: true },
        });
        if (!order) {
            throw new common_1.NotFoundException('Đơn hàng không tồn tại');
        }
        if (!['pending', 'confirmed'].includes(order.status)) {
            throw new common_1.BadRequestException('Không thể hủy đơn hàng này');
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
    async generateOrderCode() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const count = await this.prisma.order.count();
        const sequence = String(count + 1).padStart(4, '0');
        return `TK${year}${month}${day}${sequence}`;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        microservices_1.ClientProxy])
], OrderService);
//# sourceMappingURL=order.service.js.map