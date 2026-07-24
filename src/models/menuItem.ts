import { model, Model, Schema } from "mongoose";
import { IMenuItem } from "../types/models/menuItem.js";

type MenuItemModel = Model<IMenuItem>;

const menuItemSchema = new Schema<IMenuItem, MenuItemModel>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },
    variants: [
      {
        combination: { type: Schema.Types.Mixed, default: {} },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    availableExtras: [{ type: Schema.Types.ObjectId, ref: "MenuExtra" }],
    removableIngredients: [{ type: String, trim: true }],
    imageUrl: { type: String, trim: true },
    imagePublicId: {
      type: String,
      required: false,
    },
    available: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const MenuItem = model<IMenuItem, MenuItemModel>(
  "MenuItem",
  menuItemSchema,
);
