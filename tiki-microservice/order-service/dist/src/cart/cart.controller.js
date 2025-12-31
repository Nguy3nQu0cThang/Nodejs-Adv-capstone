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
var CartController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const cart_service_1 = require("./cart.service");
let CartController = CartController_1 = class CartController {
    cartService;
    logger = new common_1.Logger(CartController_1.name);
    constructor(cartService) {
        this.cartService = cartService;
    }
    async getCart(data) {
        this.logger.log(`Getting cart for user ${data.userId}`);
        return this.cartService.getCart(data.userId);
    }
    async addToCart(data) {
        this.logger.log(`Adding to cart for user ${data.userId}`);
        return this.cartService.addToCart(data.userId, data.dto);
    }
    async updateCart(data) {
        this.logger.log(`Updating cart item ${data.cartId}`);
        return this.cartService.updateCart(data.userId, data.cartId, data.dto);
    }
    async removeFromCart(data) {
        this.logger.log(`Removing cart item ${data.cartId}`);
        return this.cartService.removeFromCart(data.userId, data.cartId);
    }
    async clearCart(data) {
        this.logger.log(`Clearing cart for user ${data.userId}`);
        return this.cartService.clearCart(data.userId);
    }
};
exports.CartController = CartController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_cart' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'add_to_cart' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addToCart", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update_cart' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateCart", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'remove_from_cart' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeFromCart", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'clear_cart' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
exports.CartController = CartController = CartController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map