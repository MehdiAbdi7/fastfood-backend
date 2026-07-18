import { model, Model, Schema } from "mongoose";
import { ITable } from "../types/models/table.js";

type TableModel = Model<ITable>;

const tableSchema = new Schema<ITable, TableModel>(
  {
    tableN: { type: Number, required: true, unique: true, min: 1 },
    status: { type: String, enum: ["free", "occupied"], default: "free" },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true },
);

export const Table = model<ITable, TableModel>("Table", tableSchema);
