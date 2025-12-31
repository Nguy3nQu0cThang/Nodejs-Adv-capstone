import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            token: string;
            user: {
                user_id: number;
                email: string;
                full_name: string;
                phone: string | null;
                role: string;
                created_at: Date;
            };
        };
    }>;
    login(dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            token: string;
            user: {
                user_id: number;
                email: string;
                full_name: string;
                phone: string | null;
                role: string;
            };
        };
    }>;
    validateToken(token: string): Promise<{
        success: boolean;
        valid: boolean;
        user: {
            user_id: number;
            email: string;
            full_name: string;
            phone: string | null;
            role: string;
            is_active: boolean;
        };
        error?: undefined;
    } | {
        success: boolean;
        valid: boolean;
        error: string;
        user?: undefined;
    }>;
    getUserById(userId: number): Promise<{
        user_id: number;
        email: string;
        full_name: string;
        phone: string | null;
        role: string;
        is_active: boolean;
    }>;
    private generateToken;
}
