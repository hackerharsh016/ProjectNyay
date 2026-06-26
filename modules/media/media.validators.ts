import { z } from "zod";

export const uploadUrlSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

export const nativeUploadSchema = z.object({
  caseId: z.string().uuid(),
  storageKey: z.string().min(1),
  caption: z.string().optional(),
});

export const embedSchema = z.object({
  caseId: z.string().uuid(),
  sourceUrl: z.string().url(),
  caption: z.string().optional(),
});

export const reportSchema = z.object({
  reason: z.string().min(5).max(500),
});
