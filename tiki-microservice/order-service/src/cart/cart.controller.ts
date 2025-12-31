import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @MessagePattern({ cmd: 'get_cart' })
  async getCart(@Payload() data: { userId: number }) {
    this.logger.log(`Getting cart for user ${data.userId}`);
    return this.cartService.getCart(data.userId);
  }

  @MessagePattern({ cmd: 'add_to_cart' })
  async addToCart(@Payload() data: { userId: number; dto: any }) {
    this.logger.log(`Adding to cart for user ${data.userId}`);
    return this.cartService.addToCart(data.userId, data.dto);
  }

  @MessagePattern({ cmd: 'update_cart' })
  async updateCart(@Payload() data: { userId: number; cartId: number; dto: any }) {
    this.logger.log(`Updating cart item ${data.cartId}`);
    return this.cartService.updateCart(data.userId, data.cartId, data.dto);
  }

  @MessagePattern({ cmd: 'remove_from_cart' })
  async removeFromCart(@Payload() data: { userId: number; cartId: number }) {
    this.logger.log(`Removing cart item ${data.cartId}`);
    return this.cartService.removeFromCart(data.userId, data.cartId);
  }

  @MessagePattern({ cmd: 'clear_cart' })
  async clearCart(@Payload() data: { userId: number }) {
    this.logger.log(`Clearing cart for user ${data.userId}`);
    return this.cartService.clearCart(data.userId);
  }
}