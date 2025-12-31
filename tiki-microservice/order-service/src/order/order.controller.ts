import { Controller, Logger, Inject } from '@nestjs/common';
import { MessagePattern, Payload, ClientProxy } from '@nestjs/microservices';
import { OrderService } from './order.service';

@Controller()
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    private readonly orderService: OrderService,
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'create_order' })
  async createOrder(@Payload() data: { userId: number; dto: any }) {
    this.logger.log(`Creating order for user ${data.userId}`);
    const order = await this.orderService.createOrder(data.userId, data.dto);

    // Emit event to Product Service to update stock
    this.productClient.emit('order_created', {
      order_id: order.data.order_id,
      order_code: order.data.order_code,
      user_id: data.userId,
      items: order.data.items,
    });

    return order;
  }

  @MessagePattern({ cmd: 'get_my_orders' })
  async getMyOrders(@Payload() data: { userId: number; query: any }) {
    this.logger.log(`Getting orders for user ${data.userId}`);
    return this.orderService.getMyOrders(data.userId, data.query);
  }

  @MessagePattern({ cmd: 'get_order_detail' })
  async getOrderDetail(@Payload() data: { userId: number; orderId: number }) {
    this.logger.log(`Getting order detail: ${data.orderId}`);
    return this.orderService.getOrderDetail(data.userId, data.orderId);
  }

  @MessagePattern({ cmd: 'cancel_order' })
  async cancelOrder(@Payload() data: { userId: number; orderId: number; reason?: string }) {
    this.logger.log(`Cancelling order: ${data.orderId}`);
    const result = await this.orderService.cancelOrder(data.userId, data.orderId, data.reason);

    // Get order items to restore stock
    const orderDetail = await this.orderService.getOrderDetail(data.userId, data.orderId);

    // Emit event to Product Service to restore stock
    this.productClient.emit('order_cancelled', {
      order_id: data.orderId,
      user_id: data.userId,
      items: orderDetail.data.items,
    });

    return result;
  }

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    return { status: 'ok', service: 'order' };
  }
}