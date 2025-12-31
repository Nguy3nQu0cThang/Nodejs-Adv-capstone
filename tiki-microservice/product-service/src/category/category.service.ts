import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: categories,
    };
  }

  async getCategoryTree() {
    const rootCategories = await this.prisma.category.findMany({
      where: {
        is_active: true,
        parent_id: null,
      },
      include: {
        children: {
          where: { is_active: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      success: true,
      data: rootCategories,
    };
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { category_id: id, is_active: true },
      include: {
        parent: true,
        children: { where: { is_active: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return {
      success: true,
      data: category,
    };
  }
}