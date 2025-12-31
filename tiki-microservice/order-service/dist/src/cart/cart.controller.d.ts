import { CartService } from './cart.service';
export declare class CartController {
    private readonly cartService;
    private readonly logger;
    constructor(cartService: CartService);
    getCart(data: {
        userId: number;
    }): Promise<{
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
    addToCart(data: {
        userId: number;
        dto: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    updateCart(data: {
        userId: number;
        cartId: number;
        dto: any;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    removeFromCart(data: {
        userId: number;
        cartId: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    clearCart(data: {
        userId: number;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
