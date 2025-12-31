import { CategoryService } from './category.service';
export declare class CategoryController {
    private readonly categoryService;
    private readonly logger;
    constructor(categoryService: CategoryService);
    findAll(): Promise<{
        success: boolean;
        data: {
            name: string;
            slug: string;
            description: string | null;
            is_active: boolean;
            category_id: number;
            created_at: Date;
            image_url: string | null;
            parent_id: number | null;
        }[];
    }>;
    getTree(): Promise<{
        success: boolean;
        data: ({
            children: {
                name: string;
                slug: string;
                description: string | null;
                is_active: boolean;
                category_id: number;
                created_at: Date;
                image_url: string | null;
                parent_id: number | null;
            }[];
        } & {
            name: string;
            slug: string;
            description: string | null;
            is_active: boolean;
            category_id: number;
            created_at: Date;
            image_url: string | null;
            parent_id: number | null;
        })[];
    }>;
    findOne(data: {
        id: number;
    }): Promise<{
        success: boolean;
        data: {
            parent: {
                name: string;
                slug: string;
                description: string | null;
                is_active: boolean;
                category_id: number;
                created_at: Date;
                image_url: string | null;
                parent_id: number | null;
            } | null;
            children: {
                name: string;
                slug: string;
                description: string | null;
                is_active: boolean;
                category_id: number;
                created_at: Date;
                image_url: string | null;
                parent_id: number | null;
            }[];
        } & {
            name: string;
            slug: string;
            description: string | null;
            is_active: boolean;
            category_id: number;
            created_at: Date;
            image_url: string | null;
            parent_id: number | null;
        };
    }>;
}
