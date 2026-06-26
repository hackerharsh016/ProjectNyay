import { z } from "zod";
import { CaseVisibility, CaseStatus } from "@prisma/client";

export const createCaseSchema = z.object({
  title: z.string().min(5).max(100),
  shortDescription: z.string().min(10).max(500),
  categoryId: z.string().uuid(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  thumbnailUrl: z.string().url().optional(),
});

export const updateCaseSchema = createCaseSchema.partial();

export const updateVisibilitySchema = z.object({
  visibility: z.nativeEnum(CaseVisibility).optional(),
  status: z.nativeEnum(CaseStatus).optional(),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
export type UpdateVisibilityInput = z.infer<typeof updateVisibilitySchema>;
