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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.ValidateTokenDto = exports.LoginDto = exports.RegisterDto = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const rxjs_1 = require("rxjs");
class RegisterDto {
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123', minLength: 6 }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được để trống' }),
    (0, class_validator_1.MinLength)(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Nguyễn Văn A' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Họ tên không được để trống' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "full_name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '0123456789', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
class LoginDto {
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Email không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email không được để trống' }),
    __metadata("design:type", String)
], LoginDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mật khẩu không được để trống' }),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class ValidateTokenDto {
}
exports.ValidateTokenDto = ValidateTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Token không được để trống' }),
    __metadata("design:type", String)
], ValidateTokenDto.prototype, "token", void 0);
let AuthController = AuthController_1 = class AuthController {
    constructor(authClient) {
        this.authClient = authClient;
        this.logger = new common_1.Logger(AuthController_1.name);
    }
    async onModuleInit() {
        try {
            await this.authClient.connect();
            this.logger.log('✅ Connected to Auth Service');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to Auth Service', error);
        }
    }
    async sendToMicroservice(pattern, data, errorContext, defaultStatus = common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
        try {
            return await (0, rxjs_1.firstValueFrom)(this.authClient.send(pattern, data).pipe((0, rxjs_1.timeout)(5000), (0, rxjs_1.catchError)((error) => {
                if (error instanceof rxjs_1.TimeoutError) {
                    throw new common_1.HttpException('Service timeout', common_1.HttpStatus.GATEWAY_TIMEOUT);
                }
                return (0, rxjs_1.throwError)(() => error);
            })));
        }
        catch (error) {
            this.logger.error(`${errorContext}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            const status = error?.statusCode || error?.status || defaultStatus;
            const message = error?.message || error?.error || 'Internal server error';
            throw new common_1.HttpException(message, status);
        }
    }
    async register(dto) {
        this.logger.log('Forwarding register request to Auth Service');
        return this.sendToMicroservice({ cmd: 'register' }, dto, 'Register error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async login(dto) {
        this.logger.log('Forwarding login request to Auth Service');
        return this.sendToMicroservice({ cmd: 'login' }, dto, 'Login error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
    }
    async validateToken(dto) {
        this.logger.log('Validating token');
        return this.sendToMicroservice({ cmd: 'validate_token' }, { token: dto.token }, 'Validate token error', common_1.HttpStatus.UNAUTHORIZED);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng ký tài khoản' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Đăng ký thành công' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email đã tồn tại' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: 504, description: 'Gateway timeout' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Đăng nhập' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Đăng nhập thành công' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Email hoặc mật khẩu không đúng' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Dữ liệu không hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: 504, description: 'Gateway timeout' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('validate'),
    (0, swagger_1.ApiOperation)({ summary: 'Validate JWT token' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token hợp lệ' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Token không hợp lệ hoặc hết hạn' }),
    (0, swagger_1.ApiResponse)({ status: 504, description: 'Gateway timeout' }),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ValidateTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('api/auth'),
    __param(0, (0, common_1.Inject)('AUTH_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], AuthController);
//# sourceMappingURL=auth.controller.js.map