import { Counter } from "../models/counter.js";

export async function getNextOrderNumber(): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { key: "orderCounter" },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  );

  return counter.value;
}

export async function resetOrderCounter(): Promise<number> {
  const counter = await Counter.findOneAndUpdate(
    { key: "orderCounter" },
    { $set: { value: 0 } },
    { new: true, upsert: true },
  );

  return counter.value;
}
