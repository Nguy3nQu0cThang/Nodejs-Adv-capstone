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
const product_service_1 = require("./product.service");
let ProductController = ProductController_1 = class ProductController {
    productService;
    logger = new common_1.Logger(ProductController_1.name);
    constructor(productService) {
        this.productService = productService;
    }
    async findAll(query) {
        this.logger.log('Received get_products request');
        return this.productService.findAll(query);
    }
    async findOne(data) {
        this.logger.log(`Received get_product_by_id: ${data.id}`);
        return this.productService.findOne(data.id);
    }
    async findBySlug(data) {
        this.logger.log(`Received get_product_by_slug: ${data.slug}`);
        return this.productService.findBySlug(data.slug);
    }
    async getFeatured(data) {
        this.logger.log('Received get_featured_products request');
        return this.productService.getFeaturedProducts(data.limit);
    }
    async getBestSelling(data) {
        this.logger.log('Received get_best_selling_products request');
        return this.productService.getBestSellingProducts(data.limit);
    }
    async checkStock(data) {
        this.logger.log(`Checking stock for product ${data.productId}`);
        return this.productService.checkStock(data.productId, data.quantity);
    }
    async updateStock(data) {
        this.logger.log(`Updating stock for product ${data.productId}: ${data.quantity}`);
        return this.productService.updateStock(data.productId, data.quantity);
    }
    async healthCheck() {
        return { status: 'ok', service: 'product' };
    }
    async handleOrderCreated(data) {
        this.logger.log('📦 Received order_created event', JSON.stringify(data));
        for (const item of data.items) {
            await this.productService.updateStock(item.product_id, -item.quantity);
        }
    }
    async handleOrderCancelled(data) {
        this.logger.log('📦 Received order_cancelled event', JSON.stringify(data));
        for (const item of data.items) {
            await this.productService.updateStock(item.product_id, item.quantity);
        }
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_products' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_product_by_id' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_product_by_slug' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "findBySlug", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_featured_products' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getFeatured", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_best_selling_products' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getBestSelling", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'check_stock' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "checkStock", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'update_stock' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateStock", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'health_check' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "healthCheck", null);
__decorate([
    (0, microservices_1.EventPattern)('order_created'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "handleOrderCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('order_cancelled'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "handleOrderCancelled", null);
exports.ProductController = ProductController = ProductController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [product_service_1.ProductService])
], ProductController);
//# sourceMappingURL=product.controller.js.map