import { 
  Controller, 
  Get, 
  Post,
  Body,
  Param,
  Query,
  Inject, 
  HttpException,
  HttpStatus,
  Logger,
  ParseIntPipe,
  Headers 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom, timeout } from 'rxjs';

@ApiTags('Order')
@Controller('api/orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(
    @Inject('ORDER_SERVICE') private readonly orderClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.orderClient.connect();
      this.logger.log('✅ Connected to Order Service');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Order Service', error);
    }
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tạo đơn hàng' })
  async createOrder(
    @Headers('authorization') auth: string,
    @Body() dto: any,
  ) {
    try {
      // Extract userId from token (simplified - should validate token first)
      const userId = 1; // TODO: Get from validated token
      
      this.logger.log('Forwarding create order request');
      
      const result = await firstValueFrom(
        this.orderClient
          .send({ cmd: 'create_order' }, { userId, dto })
          .pipe(timeout(10000))
      );
      
      return result;
    } catch (error) {
      this.logger.error('Create order error:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng' })
  async getOrders(
    @Headers('authorization') auth: string,
    @Query() query: any,
  ) {
    try {
      const userId = 1; // TODO: Get from validated token
      
      const result = await firstValueFrom(
        this.orderClient
          .send({ cmd: 'get_my_orders' }, { userId, query })
          .pipe(timeout(10000))
      );
      
      return result;
    } catch (error) {
      this.logger.error('Get orders error:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}