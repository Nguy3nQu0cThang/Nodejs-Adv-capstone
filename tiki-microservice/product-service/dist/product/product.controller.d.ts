import { ProductService } from './product.service';
export declare class ProductController {
    private readonly productService;
    private readonly logger;
    constructor(productService: ProductService);
    findAll(query: any): Promise<any>;
    findOne(data: {
        id: number;
    }): Promise<any>;
    findBySlug(data: {
        slug: string;
    }): Promise<{
        success: boolean;
        data: {
            category: {
                name: string;
                slug: string;
                description: string | null;
                is_active: boolean;
                category_id: number;
                created_at: Date;
                image_url: string | null;
                parent_id: number | null;
            };
            images: {
                product_id: number;
                image_url: string;
                position: number;
                is_primary: boolean;
                image_id: number;
            }[];
            specifications: {
                product_id: number;
                name: string;
                value: string;
                spec_id: number;
            }[];
        } & {
            product_id: number;
            name: string;
            slug: string;
            description: string | null;
            short_description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            discount_percent: number;
            quantity_in_stock: number;
            sold_count: number;
            view_count: number;
            rating_average: import("@prisma/client/runtime/library").Decimal;
            review_count: number;
            thumbnail: string | null;
            is_active: boolean;
            is_featured: boolean;
            brand: string | null;
            category_id: number;
            created_at: Date;
            updated_at: Date;
        };
    }>;
    getFeatured(data: {
        limit?: number;
    }): Promise<{
        success: boolean;
        data: ({
            category: {
                name: string;
                slug: string;
            };
        } & {
            product_id: number;
            name: string;
            slug: string;
            description: string | null;
            short_description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            discount_percent: number;
            quantity_in_stock: number;
            sold_count: number;
            view_count: number;
            rating_average: import("@prisma/client/runtime/library").Decimal;
            review_count: number;
            thumbnail: string | null;
            is_active: boolean;
            is_featured: boolean;
            brand: string | null;
            category_id: number;
            created_at: Date;
            updated_at: Date;
        })[];
    }>;
    getBestSelling(data: {
        limit?: number;
    }): Promise<{
        success: boolean;
        data: ({
            category: {
                name: string;
                slug: string;
            };
        } & {
            product_id: number;
            name: string;
            slug: string;
            description: string | null;
            short_description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            original_price: import("@prisma/client/runtime/library").Decimal | null;
            discount_percent: number;
            quantity_in_stock: number;
            sold_count: number;
            view_count: number;
            rating_average: import("@prisma/client/runtime/library").Decimal;
            review_count: number;
            thumbnail: string | null;
            is_active: boolean;
            is_featured: boolean;
            brand: string | null;
            category_id: number;
            created_at: Date;
            updated_at: Date;
        })[];
    }>;
    checkStock(data: {
        productId: number;
        quantity: number;
    }): Promise<{
        success: boolean;
        available: boolean;
        product_id: number;
        requested: number;
        in_stock: number;
    }>;
    updateStock(data: {
        productId: number;
        quantity: number;
    }): Promise<{
        success: boolean;
        message: string;
        product_id: number;
        quantity_change: number;
        new_stock: number;
    }>;
    healthCheck(): Promise<{
        status: string;
        service: string;
    }>;
    handleOrderCreated(data: any): Promise<void>;
    handleOrderCancelled(data: any): Promise<void>;
}
