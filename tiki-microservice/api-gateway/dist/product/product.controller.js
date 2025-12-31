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
var ProductController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
let ProductController = ProductController_1 = class ProductController {
    constructor(productClient) {
        this.productClient = productClient;
        this.logger = new common_1.Logger(ProductController_1.name);
    }
    async onModuleInit() {
        try {
            await this.productClient.connect();
            this.logger.log('✅ Connected to Product Service');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to Product Service', error);
        }
    }
    async findAll(query) {
        try {
            this.logger.log('Forwarding get products request');
            const result = await (0, rxjs_1.firstValueFrom)(this.productClient
                .send({ cmd: 'get_products' }, query)
                .pipe((0, rxjs_1.timeout)(10000)));
            return result;
        }
        catch (error) {
            this.logger.error('Get products error:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', error.statusCode || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            this.logger.log(`Forwarding get product ${id} request`);
            const result = await (0, rxjs_1.firstValueFrom)(this.productClient
                .send({ cmd: 'get_product_by_id' }, { id })
                .pipe((0, rxjs_1.timeout)(5000)));
            return result;
        }
        catch (error) {
            this.logger.error('Get product error:', error);
            throw new common_1.HttpException(error.message || 'Internal server error', error.statusCode || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách sản phẩm' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy chi tiết sản phẩm' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
exports.ProductController = ProductController = ProductController_1 = __decorate([
    (0, swagger_1.ApiTags)('Product'),
    (0, common_1.Controller)('api/products'),
    __param(0, (0, common_1.Inject)('PRODUCT_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], ProductController);
//# sourceMappingURL=product.controller.js.map