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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const prisma_service_1 = require("../prisma/prisma.service");
const rxjs_1 = require("rxjs");
let CartService = class CartService {
    prisma;
    productClient;
    constructor(prisma, productClient) {
        this.prisma = prisma;
        this.productClient = productClient;
    }
    async getCart(userId) {
        const cartItems = await this.prisma.cart.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
        });
        const itemsWithDetails = await Promise.all(cartItems.map(async (item) => {
            try {
                const product = await (0, rxjs_1.firstValueFrom)(this.productClient
                    .send({ cmd: 'get_product_by_id' }, { id: item.product_id })
                    .pipe((0, rxjs_1.timeout)(5000)));
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
            }
            catch (error) {
                return null;
            }
        }));
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
    async addToCart(userId, dto) {
        const { product_id, quantity } = dto;
        const stockCheck = await (0, rxjs_1.firstValueFrom)(this.productClient
            .send({ cmd: 'check_stock' }, { productId: product_id, quantity })
            .pipe((0, rxjs_1.timeout)(5000)));
        if (!stockCheck.available) {
            throw new common_1.BadRequestException(`Sản phẩm chỉ còn ${stockCheck.in_stock} trong kho`);
        }
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
            const newStockCheck = await (0, rxjs_1.firstValueFrom)(this.productClient
                .send({ cmd: 'check_stock' }, { productId: product_id, quantity: newQuantity })
                .pipe((0, rxjs_1.timeout)(5000)));
            if (!newStockCheck.available) {
                throw new common_1.BadRequestException(`Số lượng vượt quá tồn kho (còn ${newStockCheck.in_stock})`);
            }
            await this.prisma.cart.update({
                where: { cart_id: existingCart.cart_id },
                data: { quantity: newQuantity },
            });
        }
        else {
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
    async updateCart(userId, cartId, dto) {
        const { quantity } = dto;
        const cartItem = await this.prisma.cart.findFirst({
            where: {
                cart_id: cartId,
                user_id: userId,
            },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Sản phẩm không có trong giỏ hàng');
        }
        const stockCheck = await (0, rxjs_1.firstValueFrom)(this.productClient
            .send({ cmd: 'check_stock' }, { productId: cartItem.product_id, quantity })
            .pipe((0, rxjs_1.timeout)(5000)));
        if (!stockCheck.available) {
            throw new common_1.BadRequestException(`Sản phẩm chỉ còn ${stockCheck.in_stock} trong kho`);
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
    async removeFromCart(userId, cartId) {
        const cartItem = await this.prisma.cart.findFirst({
            where: {
                cart_id: cartId,
                user_id: userId,
            },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Sản phẩm không có trong giỏ hàng');
        }
        await this.prisma.cart.delete({
            where: { cart_id: cartId },
        });
        return {
            success: true,
            message: 'Xóa sản phẩm khỏi giỏ hàng thành công',
        };
    }
    async clearCart(userId) {
        await this.prisma.cart.deleteMany({
            where: { user_id: userId },
        });
        return {
            success: true,
            message: 'Đã xóa toàn bộ giỏ hàng',
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        microservices_1.ClientProxy])
], CartService);
//# sourceMappingURL=cart.service.js.map