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
var OrderController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const order_service_1 = require("./order.service");
let OrderController = OrderController_1 = class OrderController {
    orderService;
    productClient;
    logger = new common_1.Logger(OrderController_1.name);
    constructor(orderService, productClient) {
        this.orderService = orderService;
        this.productClient = productClient;
    }
    async createOrder(data) {
        this.logger.log(`Creating order for user ${data.userId}`);
        const order = await this.orderService.createOrder(data.userId, data.dto);
        this.productClient.emit('order_created', {
            order_id: order.data.order_id,
            order_code: order.data.order_code,
            user_id: data.userId,
            items: order.data.items,
        });
        return order;
    }
    async getMyOrders(data) {
        this.logger.log(`Getting orders for user ${data.userId}`);
        return this.orderService.getMyOrders(data.userId, data.query);
    }
    async getOrderDetail(data) {
        this.logger.log(`Getting order detail: ${data.orderId}`);
        return this.orderService.getOrderDetail(data.userId, data.orderId);
    }
    async cancelOrder(data) {
        this.logger.log(`Cancelling order: ${data.orderId}`);
        const result = await this.orderService.cancelOrder(data.userId, data.orderId, data.reason);
        const orderDetail = await this.orderService.getOrderDetail(data.userId, data.orderId);
        this.productClient.emit('order_cancelled', {
            order_id: data.orderId,
            user_id: data.userId,
            items: orderDetail.data.items,
        });
        return result;
    }
    async healthCheck() {
        return { status: 'ok', service: 'order' };
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'create_order' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_my_orders' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getMyOrders", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_order_detail' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderDetail", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'cancel_order' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "cancelOrder", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'health_check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "healthCheck", null);
exports.OrderController = OrderController = OrderController_1 = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [order_service_1.OrderService,
        microservices_1.ClientProxy])
], OrderController);
//# sourceMappingURL=order.controller.js.map