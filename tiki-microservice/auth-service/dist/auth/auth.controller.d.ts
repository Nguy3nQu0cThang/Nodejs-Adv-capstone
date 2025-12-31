import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    private readonly logger;
    constructor(authService: AuthService);
    register(data: any): Promise<{
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
    login(data: any): Promise<{
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
    validateToken(data: {
        token: string;
    }): Promise<{
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
    getUserById(data: {
        userId: number;
    }): Promise<{
        user_id: number;
        email: string;
        full_name: string;
        phone: string | null;
        role: string;
        is_active: boolean;
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
    }>;
}
