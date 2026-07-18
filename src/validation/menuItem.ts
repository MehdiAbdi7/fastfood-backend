import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "ID invalide",
});

const variantSchema = z.object({
  combination: z.record(z.string(), z.string()),
  price: z.number().nonnegative(),
});

export const createMenuItemSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100),
  description: z.string().trim().optional(),
  category: objectIdSchema,
  variants: z.array(variantSchema).min(1, "Au moins un variant est requis"),
  availableExtras: z.array(objectIdSchema).default([]).optional(),
  removableIngredients: z.array(z.string().trim()).default([]).optional(),
  available: z.boolean().default(true).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
