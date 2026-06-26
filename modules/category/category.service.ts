import prisma from "../../src/lib/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.validators";

export class CategoryService {
  static async list() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
  }

  static async getById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  static async create(data: CreateCategoryInput) {
    // Check if name already exists
    const existing = await prisma.category.findUnique({ where: { name: data.name } });
    if (existing) throw new Error("Category name already exists");

    return prisma.category.create({ data });
  }

  static async update(id: string, data: UpdateCategoryInput) {
    if (data.name) {
      const existing = await prisma.category.findUnique({ where: { name: data.name } });
      if (existing && existing.id !== id) throw new Error("Category name already exists");
    }
    return prisma.category.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}
