"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding Product database...');
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { slug: 'dien-thoai' },
            update: {},
            create: {
                name: 'Điện Thoại - Máy Tính Bảng',
                slug: 'dien-thoai',
                image_url: 'https://via.placeholder.com/150',
                is_active: true,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'laptop' },
            update: {},
            create: {
                name: 'Laptop - Thiết bị IT',
                slug: 'laptop',
                image_url: 'https://via.placeholder.com/150',
                is_active: true,
            },
        }),
        prisma.category.upsert({
            where: { slug: 'sach' },
            update: {},
            create: {
                name: 'Nhà Sách Tiki',
                slug: 'sach',
                image_url: 'https://via.placeholder.com/150',
                is_active: true,
            },
        }),
    ]);
    console.log('✅ Categories created:', categories.length);
    const products = [
        {
            name: 'iPhone 15 Pro Max 256GB',
            slug: 'iphone-15-pro-max-256gb',
            description: 'iPhone 15 Pro Max với chip A17 Pro mạnh mẽ',
            short_description: 'Chip A17 Pro | Camera 48MP | Titan',
            price: 34990000,
            original_price: 39990000,
            discount_percent: 13,
            quantity_in_stock: 50,
            sold_count: 245,
            rating_average: 4.8,
            review_count: 128,
            thumbnail: 'https://via.placeholder.com/400',
            is_featured: true,
            brand: 'Apple',
            category_id: categories[0].category_id,
        },
        {
            name: 'Samsung Galaxy S24 Ultra',
            slug: 'samsung-galaxy-s24-ultra',
            description: 'Samsung Galaxy S24 Ultra với Galaxy AI',
            short_description: 'Snapdragon 8 Gen 3 | Camera 200MP',
            price: 29990000,
            original_price: 33990000,
            discount_percent: 12,
            quantity_in_stock: 35,
            sold_count: 189,
            rating_average: 4.7,
            review_count: 95,
            thumbnail: 'https://via.placeholder.com/400',
            is_featured: true,
            brand: 'Samsung',
            category_id: categories[0].category_id,
        },
        {
            name: 'Laptop Dell Inspiron 15',
            slug: 'laptop-dell-inspiron-15',
            description: 'Laptop Dell Inspiron 15 với Intel Core i5',
            short_description: 'Intel Core i5 | RAM 8GB | SSD 512GB',
            price: 13990000,
            original_price: 16990000,
            discount_percent: 18,
            quantity_in_stock: 28,
            sold_count: 156,
            rating_average: 4.5,
            review_count: 78,
            thumbnail: 'https://via.placeholder.com/400',
            is_featured: false,
            brand: 'Dell',
            category_id: categories[1].category_id,
        },
        {
            name: 'Đắc Nhân Tâm',
            slug: 'dac-nhan-tam',
            description: 'Sách Đắc Nhân Tâm - Dale Carnegie',
            short_description: 'Tác giả: Dale Carnegie | NXB Trí Việt',
            price: 86000,
            original_price: 108000,
            discount_percent: 20,
            quantity_in_stock: 500,
            sold_count: 5420,
            rating_average: 4.9,
            review_count: 3254,
            thumbnail: 'https://via.placeholder.com/400',
            is_featured: true,
            brand: 'NXB Trí Việt',
            category_id: categories[2].category_id,
        },
    ];
    for (const product of products) {
        await prisma.product.create({
            data: {
                ...product,
                images: {
                    create: [
                        {
                            image_url: product.thumbnail,
                            is_primary: true,
                            position: 1,
                        },
                    ],
                },
                specifications: {
                    create: [
                        { name: 'Thương hiệu', value: product.brand },
                        { name: 'Bảo hành', value: '12 tháng' },
                    ],
                },
            },
        });
    }
    console.log('✅ Products created:', products.length);
    console.log('🎉 Seed completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map