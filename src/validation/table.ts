import { z } from "zod";

export const createTableSchema = z.object({
  tableN: z.number().int().min(1, "Le numéro de table doit être positif"),
});

export const updateTableSchema = z.object({
  tableN: z.number().int().min(1).optional(),
  status: z.enum(["free", "occupied"]).optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
