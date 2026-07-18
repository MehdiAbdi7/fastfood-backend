import { z } from "zod";
import { Types } from "mongoose";

const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "ID invalide",
});

const orderItemExtraSchema = z.object({
  extraId: objectIdSchema,
  name: z.string().min(1),
  price: z.number().nonnegative(),
});

const orderItemSchema = z.object({
  menuItemId: objectIdSchema,
  name: z.string().min(1),
  variantSelected: z.record(z.string(), z.string()).default({}),
  unitPrice: z.number().nonnegative(),
  selectedExtras: z.array(orderItemExtraSchema).default([]),
  excludedIngredients: z.array(z.string().trim()).default([]),
  quantity: z.number().int().min(1),
});

// Chaque type de commande a ses propres champs client obligatoires
const dineInSchema = z.object({
  type: z.literal("dine_in"),
  table: objectIdSchema,
  client: z.object({
    fullName: z.string().trim().min(1, "Le nom est requis"),
  }),
  remark: z.string().trim().optional(),
});

const takeawaySchema = z.object({
  type: z.literal("takeaway"),
  client: z.object({
    fullName: z.string().trim().min(1, "Le nom est requis"),
    phone: z.string().trim().min(10, "Le téléphone est requis"),
  }),
});

const deliverySchema = z.object({
  type: z.literal("delivery"),
  client: z.object({
    fullName: z.string().trim().min(1, "Le nom est requis"),
    phone: z.string().trim().min(10, "Le téléphone est requis"),
    address: z.string().trim().min(1, "L'adresse est requise"),
  }),
});

const commonSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Au moins un item est requis"),
});

export const createOrderSchema = z.discriminatedUnion("type", [
  dineInSchema.extend(commonSchema.shape),
  takeawaySchema.extend(commonSchema.shape),
  deliverySchema.extend(commonSchema.shape),
]);

// Pour l'ajout manuel d'items à une commande takeaway/delivery existante (pending)
export const addItemsToOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Au moins un item est requis"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "ready", "completed", "cancelled"]),
});

// Le staff fixe le prix de livraison manuellement quand la commande arrive (dashboard)
export const setDeliveryFeeSchema = z.object({
  deliveryFee: z.number().nonnegative("Le prix de livraison doit être positif"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddItemsToOrderInput = z.infer<typeof addItemsToOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type SetDeliveryFeeInput = z.infer<typeof setDeliveryFeeSchema>;
