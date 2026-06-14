import { z } from "zod";

export const sourceSchema = z.object({
  name: z.string().min(2).max(120),
  url: z.url(),
  websiteUrl: z.url().optional().or(z.literal("")),
  description: z.string().max(280).optional().or(z.literal("")),
  categoryId: z.string().min(1),
});

export const sourceUpdateSchema = sourceSchema.extend({
  enabled: z.boolean().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(200).optional().or(z.literal("")),
});
