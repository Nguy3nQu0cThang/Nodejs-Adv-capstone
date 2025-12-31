import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';

@Controller()
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {}

  @MessagePattern({ cmd: 'get_categories' })
  async findAll() {
    this.logger.log('Received get_categories request');
    return this.categoryService.findAll();
  }

  @MessagePattern({ cmd: 'get_category_tree' })
  async getTree() {
    this.logger.log('Received get_category_tree request');
    return this.categoryService.getCategoryTree();
  }

  @MessagePattern({ cmd: 'get_category_by_id' })
  async findOne(@Payload() data: { id: number }) {
    this.logger.log(`Received get_category_by_id: ${data.id}`);
    return this.categoryService.findOne(data.id);
  }
}
