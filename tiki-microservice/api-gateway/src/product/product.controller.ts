import { 
  Controller, 
  Get, 
  Param, 
  Query,
  Inject, 
  HttpException,
  HttpStatus,
  Logger,
  ParseIntPipe 
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom, timeout } from 'rxjs';

@ApiTags('Product')
@Controller('api/products')
export class ProductController {
  private readonly logger = new Logger(ProductController.name);

  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.productClient.connect();
      this.logger.log('✅ Connected to Product Service');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Product Service', error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sản phẩm' })
  async findAll(@Query() query: any) {
    try {
      this.logger.log('Forwarding get products request');
      
      const result = await firstValueFrom(
        this.productClient
          .send({ cmd: 'get_products' }, query)
          .pipe(timeout(10000))
      );
      
      return result;
    } catch (error) {
      this.logger.error('Get products error:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết sản phẩm' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      this.logger.log(`Forwarding get product ${id} request`);
      
      const result = await firstValueFrom(
        this.productClient
          .send({ cmd: 'get_product_by_id' }, { id })
          .pipe(timeout(5000))
      );
      
      return result;
    } catch (error) {
      this.logger.error('Get product error:', error);
      throw new HttpException(
        error.message || 'Internal server error',
        error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}