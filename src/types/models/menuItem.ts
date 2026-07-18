import { Types } from "mongoose";

export interface IMenuItemVariant {
  combination: Record<string, string>; // ex: { taille: "M", viande: "poulet" } ou {} si pas de variante
  price: number;
}

export interface IMenuItem {
  name: string;
  description?: string;
  category: Types.ObjectId;
  variants: IMenuItemVariant[];
  availableExtras: Types.ObjectId[];
  removableIngredients: string[];
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}
