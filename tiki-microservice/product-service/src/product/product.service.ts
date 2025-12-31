import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  private readonly CACHE_TTL = 300;
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(query: any) {
    const cacheKey = `products:${JSON.stringify(query)}`;

    // Try cache first
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        this.logger.log('🎯 Cache HIT for products list');
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn('Cache read failed, continuing without cache');
    }

    this.logger.log('💾 Cache MISS, querying database');
    const {
      page = 1,
      limit = 20,
      category,
      keyword,
      sort,
      min_price,
      max_price,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = { is_active: true };

    if (category) {
      where.category = { slug: category };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { brand: { contains: keyword } },
      ];
    }

    if (min_price !== undefined || max_price !== undefined) {
      where.price = {};
      if (min_price !== undefined) where.price.gte = min_price;
      if (max_price !== undefined) where.price.lte = max_price;
    }

    let orderBy: any = { created_at: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };
    if (sort === 'best_selling') orderBy = { sold_count: 'desc' };
    if (sort === 'rating') orderBy = { rating_average: 'desc' };

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { category_id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const result = {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    await this.redis.set(cacheKey, JSON.stringify(result), this.CACHE_TTL);

    return result;
  }

  async findOne(id: number) {
    const cacheKey = `product:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.logger.log(`🎯 Cache HIT for product ${id}`);
      return JSON.parse(cached);
    }

    this.logger.log(`💾 Cache MISS for product ${id}`);

    const product = await this.prisma.product.findUnique({
      where: { product_id: id, is_active: true },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        specifications: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const result = {
      success: true,
      data: product,
    };

    await this.redis.set(cacheKey, JSON.stringify(result), 600);

    return result;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, is_active: true },
      include: {
        category: true,
        images: { orderBy: { position: 'asc' } },
        specifications: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return {
      success: true,
      data: product,
    };
  }

  async getFeaturedProducts(limit: number = 10) {
    const products = await this.prisma.product.findMany({
      where: { is_active: true, is_featured: true },
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: products,
    };
  }

  async getBestSellingProducts(limit: number = 10) {
    const products = await this.prisma.product.findMany({
      where: { is_active: true },
      take: limit,
      include: {
        category: { select: { name: true, slug: true } },
      },
      orderBy: { sold_count: 'desc' },
    });

    return {
      success: true,
      data: products,
    };
  }

  async checkStock(productId: number, quantity: number) {
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
      select: {
        product_id: true,
        name: true,
        quantity_in_stock: true,
        is_active: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (!product.is_active) {
      throw new BadRequestException(`Product "${product.name}" is not active`);
    }

    const available = product.quantity_in_stock >= quantity;

    return {
      success: true,
      available,
      product_id: productId,
      requested: quantity,
      in_stock: product.quantity_in_stock,
    };
  }

  async updateStock(productId: number, quantityChange: number) {
    const product = await this.prisma.product.findUnique({
      where: { product_id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const newStock = product.quantity_in_stock + quantityChange;

    if (newStock < 0) {
      throw new BadRequestException(
        `Insufficient stock for product ${productId}`,
      );
    }

    await this.prisma.product.update({
      where: { product_id: productId },
      data: {
        quantity_in_stock: newStock,
        sold_count:
          quantityChange < 0
            ? { increment: Math.abs(quantityChange) }
            : product.sold_count,
      },
    });

    await this.redis.del(`product:${productId}`);
    await this.redis.delPattern('products:*');

    this.logger.log(`♻️ Cache invalidated for product ${productId}`);

    return {
      success: true,
      message: 'Stock updated successfully',
      product_id: productId,
      quantity_change: quantityChange,
      new_stock: newStock,
    };
  }
}
