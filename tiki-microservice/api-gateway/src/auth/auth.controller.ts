import {
  Controller,
  Post,
  Body,
  Inject,
  HttpException,
  HttpStatus,
  Logger,
  OnModuleInit,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';
import { firstValueFrom, timeout, catchError, throwError, TimeoutError } from 'rxjs';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  full_name!: string;

  @ApiProperty({ example: '0123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password!: string;
}

export class ValidateTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  @IsNotEmpty({ message: 'Token không được để trống' })
  token!: string;
}

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController implements OnModuleInit {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.authClient.connect();
      this.logger.log('✅ Connected to Auth Service');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Auth Service', error);
    }
  }

  /**
   * Helper method to handle microservice communication with timeout and error handling
   */
  private async sendToMicroservice<T>(
    pattern: { cmd: string },
    data: any,
    errorContext: string,
    defaultStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): Promise<T> {
    try {
      return await firstValueFrom(
        this.authClient.send(pattern, data).pipe(
          timeout(5000),
          catchError((error) => {
            if (error instanceof TimeoutError) {
              throw new HttpException('Service timeout', HttpStatus.GATEWAY_TIMEOUT);
            }
            return throwError(() => error);
          })
        )
      );
    } catch (error: any) {
      this.logger.error(`${errorContext}:`, error);

      if (error instanceof HttpException) {
        throw error;
      }

      const status = error?.statusCode || error?.status || defaultStatus;
      const message = error?.message || error?.error || 'Internal server error';

      throw new HttpException(message, status);
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 409, description: 'Email đã tồn tại' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 504, description: 'Gateway timeout' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async register(@Body() dto: RegisterDto) {
    this.logger.log('Forwarding register request to Auth Service');
    return this.sendToMicroservice(
      { cmd: 'register' },
      dto,
      'Register error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không đúng' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 504, description: 'Gateway timeout' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async login(@Body() dto: LoginDto) {
    this.logger.log('Forwarding login request to Auth Service');
    return this.sendToMicroservice(
      { cmd: 'login' },
      dto,
      'Login error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token hợp lệ' })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ hoặc hết hạn' })
  @ApiResponse({ status: 504, description: 'Gateway timeout' })
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async validateToken(@Body() dto: ValidateTokenDto) {
    this.logger.log('Validating token');
    return this.sendToMicroservice(
      { cmd: 'validate_token' },
      { token: dto.token },
      'Validate token error',
      HttpStatus.UNAUTHORIZED,
    );
  }
}