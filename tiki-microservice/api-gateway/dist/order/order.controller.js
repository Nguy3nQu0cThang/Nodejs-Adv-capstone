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
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
let OrderController = OrderController_1 = class OrderController {
    constructor(orderClient) {
        this.orderClient = orderClient;
        this.logger = new common_1.Logger(OrderController_1.name);
    }
    async onModuleInit() {
        try {
            await this.orderClient.connect();
            this.logger.log('✅ Connected to Order Service');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to Order Service', error);
        }
    }
    async createOrder(auth, dto) {
        try {
            const userId = 1;
            this.logger.log('Forwarding create order request');
            const result = await (0, rxjs_1.firstValueFrom)(this.orderClient
                .send({ cmd: 'create_order' }, { userId, dto })
                .pipe((0, rxjs_1.timeout)(10000)));
            return result;
        }
        catch (error) {
            this.logger.error('Create order error:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', error.statusCode || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getOrders(auth, query) {
        try {
            const userId = 1;
            const result = await (0, rxjs_1.firstValueFrom)(this.orderClient
                .send({ cmd: 'get_my_orders' }, { userId, query })
                .pipe((0, rxjs_1.timeout)(10000)));
            return result;
        }
        catch (error) {
            this.logger.error('Get orders error:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', error.statusCode || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.OrderController = OrderController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo đơn hàng' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách đơn hàng' }),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrders", null);
exports.OrderController = OrderController = OrderController_1 = __decorate([
    (0, swagger_1.ApiTags)('Order'),
    (0, common_1.Controller)('api/orders'),
    __param(0, (0, common_1.Inject)('ORDER_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], OrderController);
//# sourceMappingURL=order.controller.js.map