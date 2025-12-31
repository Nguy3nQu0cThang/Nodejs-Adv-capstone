import { OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
export declare class RegisterDto {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class ValidateTokenDto {
    token: string;
}
export declare class AuthController implements OnModuleInit {
    private readonly authClient;
    private readonly logger;
    constructor(authClient: ClientProxy);
    onModuleInit(): Promise<void>;
    private sendToMicroservice;
    register(dto: RegisterDto): Promise<unknown>;
    login(dto: LoginDto): Promise<unknown>;
    validateToken(dto: ValidateTokenDto): Promise<unknown>;
}
