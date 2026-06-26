import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(255).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
