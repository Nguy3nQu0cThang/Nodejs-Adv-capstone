import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
export declare class CartService {
    private prisma;
    private readonly productClient;
    constructor(prisma: PrismaService, productClient: ClientProxy);
    getCart(userId: number): Promise<{
        success: boolean;
        data: {
            items: {
                cart_id: number;
                product_id: number;
                product_name: any;
                price: number;
                quantity: number;
                thumbnail: any;
                quantity_in_stock: any;
                subtotal: number;
            }[];
            total_items: number;
            subtotal: number;
            shipping_fee: number;
            total: number;
        };
    }>;
    addToCart(userId: number, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    updateCart(userId: number, cartId: number, dto: any): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromCart(userId: number, cartId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    clearCart(userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
