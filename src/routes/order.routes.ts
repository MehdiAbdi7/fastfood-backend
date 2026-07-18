import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  addItemsToOrder,
  setDeliveryFee,
  updateOrderStatus,
  trackOrder,
} from "../controllers/order.controller.js";
import { CheckAuth } from "../middlewares/auth.js";
import { validateBodySchema } from "../middlewares/validations.js";
import {
  createOrderSchema,
  addItemsToOrderSchema,
  setDeliveryFeeSchema,
  updateOrderStatusSchema,
} from "../validation/order.js";

const orderRouter = Router();

orderRouter.get("/:id/track", trackOrder);
orderRouter.get("/", CheckAuth, getOrders);
orderRouter.get("/:id", CheckAuth, getOrderById);
orderRouter.post("/", validateBodySchema(createOrderSchema), createOrder);
orderRouter.patch(
  "/:id/items",
  CheckAuth,
  validateBodySchema(addItemsToOrderSchema),
  addItemsToOrder,
);
orderRouter.patch(
  "/:id/delivery-fee",
  CheckAuth,
  validateBodySchema(setDeliveryFeeSchema),
  setDeliveryFee,
);
orderRouter.patch(
  "/:id/status",
  CheckAuth,
  validateBodySchema(updateOrderStatusSchema),
  updateOrderStatus,
);

export default orderRouter;
