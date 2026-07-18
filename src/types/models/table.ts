import { Types } from "mongoose";

export interface ITable {
  tableN: number;
  status: "free" | "occupied";
  currentOrderId: Types.ObjectId | null; // ref Order, null si libre
  createdAt: Date;
  updatedAt: Date;
}
