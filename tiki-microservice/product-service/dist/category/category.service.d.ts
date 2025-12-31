import { PrismaService } from '../prisma/prisma.service';
export declare class CategoryService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getCategoryTree(): Promise<{
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
    findOne(id: number): Promise<{
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
