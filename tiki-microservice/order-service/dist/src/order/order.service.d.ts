import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../prisma/prisma.service';
export declare class OrderService {
    private prisma;
    private readonly productClient;
    private readonly logger;
    constructor(prisma: PrismaService, productClient: ClientProxy);
    createOrder(userId: number, dto: any): Promise<{
        success: boolean;
        message: string;
        data: {
            order_id: number;
            order_code: string;
            total_amount: number;
            status: string;
            items: any[];
        };
    }>;
    getMyOrders(userId: number, query: any): Promise<{
        success: boolean;
        data: ({
            items: {
                product_id: number;
                quantity: number;
                order_id: number;
                order_item_id: number;
                product_name: string;
                product_image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            address_id: number;
            user_id: number;
            created_at: Date;
            payment_method: string;
            note: string | null;
            updated_at: Date;
            order_code: string;
            shipping_name: string;
            shipping_phone: string;
            shipping_address: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            shipping_fee: import("@prisma/client/runtime/library").Decimal;
            discount_amount: import("@prisma/client/runtime/library").Decimal;
            total_amount: import("@prisma/client/runtime/library").Decimal;
            payment_status: string;
            status: string;
            order_id: number;
        })[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            totalPages: number;
        };
    }>;
    getOrderDetail(userId: number, orderId: number): Promise<{
        success: boolean;
        data: {
            address: {
                address_id: number;
                user_id: number;
                full_name: string;
                phone: string;
                province: string;
                district: string;
                ward: string;
                street: string;
                is_default: boolean;
                created_at: Date;
            };
            items: {
                product_id: number;
                quantity: number;
                order_id: number;
                order_item_id: number;
                product_name: string;
                product_image: string | null;
                price: import("@prisma/client/runtime/library").Decimal;
            }[];
        } & {
            address_id: number;
            user_id: number;
            created_at: Date;
            payment_method: string;
            note: string | null;
            updated_at: Date;
            order_code: string;
            shipping_name: string;
            shipping_phone: string;
            shipping_address: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            shipping_fee: import("@prisma/client/runtime/library").Decimal;
            discount_amount: import("@prisma/client/runtime/library").Decimal;
            total_amount: import("@prisma/client/runtime/library").Decimal;
            payment_status: string;
            status: string;
            order_id: number;
        };
    }>;
    cancelOrder(userId: number, orderId: number, reason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private generateOrderCode;
}
