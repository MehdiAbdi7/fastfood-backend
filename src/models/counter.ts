import { Schema, model, Document } from "mongoose";

interface ICounter extends Document {
  key: string;
  value: number;
}

const counterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

export const Counter = model<ICounter>("Counter", counterSchema);
