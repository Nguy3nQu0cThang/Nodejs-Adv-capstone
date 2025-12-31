import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: any) {
    this.logger.log('Received register request');
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: any) {
    this.logger.log('Received login request');
    return this.authService.login(data);
  }

  @MessagePattern({ cmd: 'validate_token' })
  async validateToken(@Payload() data: { token: string }) {
    this.logger.log('Received validate_token request');
    return this.authService.validateToken(data.token);
  }

  @MessagePattern({ cmd: 'get_user_by_id' })
  async getUserById(@Payload() data: { userId: number }) {
    this.logger.log(`Received get_user_by_id request: ${data.userId}`);
    return this.authService.getUserById(data.userId);
  }

  @MessagePattern({ cmd: 'health_check' })
  async healthCheck() {
    return { status: 'ok', service: 'auth' };
  }
}