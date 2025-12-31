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
var CategoryController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const category_service_1 = require("./category.service");
let CategoryController = CategoryController_1 = class CategoryController {
    categoryService;
    logger = new common_1.Logger(CategoryController_1.name);
    constructor(categoryService) {
        this.categoryService = categoryService;
    }
    async findAll() {
        this.logger.log('Received get_categories request');
        return this.categoryService.findAll();
    }
    async getTree() {
        this.logger.log('Received get_category_tree request');
        return this.categoryService.getCategoryTree();
    }
    async findOne(data) {
        this.logger.log(`Received get_category_by_id: ${data.id}`);
        return this.categoryService.findOne(data.id);
    }
};
exports.CategoryController = CategoryController;
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_categories' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_category_tree' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "getTree", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_category_by_id' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoryController.prototype, "findOne", null);
exports.CategoryController = CategoryController = CategoryController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [category_service_1.CategoryService])
], CategoryController);
//# sourceMappingURL=category.controller.js.map