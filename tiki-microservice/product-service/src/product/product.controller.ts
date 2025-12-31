import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, EventPattern } from '@nestjs/microservices';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(private readonly productService: ProductService) {}

  @MessagePattern({ cmd: 'get_products' })
  async findAll(@Payload() query: any) {
    this.logger.log('Received get_products request');
    return this.productService.findAll(query);
  }

  @MessagePattern({ cmd: 'get_product_by_id' })
  async findOne(@Payload() data: { id: number }) {
    this.logger.log(`Received get_product_by_id: ${data.id}`);
    return this.productService.findOne(data.id);
  }

  @MessagePattern({ cmd: 'get_product_by_slug' })
  async findBySlug(@Payload() data: { slug: string }) {
    this.logger.log(`Received get_product_by_slug: ${data.slug}`);
    return this.productService.findBySlug(data.slug);
  }

  @MessagePattern({ cmd: 'get_featured_products' })
  async getFeatured(@Payload() data: { limit?: number }) {
    this.logger.log('Received get_featured_products request');
    return this.productService.getFeaturedProducts(data.limit);
  }

  @MessagePattern({ cmd: 'get_best_selling_products' })
  async getBestSelling(@Payload() data: { limit?: number }) {
    this.logger.log('Received get_best_selling_products request');
    return this.productService.getBestSellingProducts(data.limit);
  }

  @MessagePattern({ cmd: 'check_stock' })
  async checkStock(@Payload() data: { productId: number; quantity: number }) {
    this.logger.log(`Checking stock for product ${data.productId}`);
    return this.productService.checkStock(data.productId, data.quantity);
  }

  @MessagePattern({ cmd: 'update_stock' })
  async updateStock(@Payload() data: { productId: number; quantity: number }) {
    this.logger.log(`Updating stock for product ${data.productId}: ${data.quantity}`);
    return this.productService.updateStock(data.productId, data.quantity);
  }

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    return { status: 'ok', service: 'product' };
  }

  // Event listener for order events (from Order Service)
  @EventPattern('order_created')
  async handleOrderCreated(@Payload() data: any) {
    this.logger.log('📦 Received order_created event', JSON.stringify(data));
    
    // Decrease stock for each item
    for (const item of data.items) {
      await this.productService.updateStock(item.product_id, -item.quantity);
    }
  }

  @EventPattern('order_cancelled')
  async handleOrderCancelled(@Payload() data: any) {
    this.logger.log('📦 Received order_cancelled event', JSON.stringify(data));
    
    // Restore stock for each item
    for (const item of data.items) {
      await this.productService.updateStock(item.product_id, item.quantity);
    }
  }
}
