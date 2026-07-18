import { Router } from "express";
import {
  createTable,
  getTables,
  updateTable,
  deleteTable,
} from "../controllers/table.controller.js";
import { CheckAuth, isAdmin } from "../middlewares/auth.js";
import { validateBodySchema } from "../middlewares/validations.js";
import { createTableSchema, updateTableSchema } from "../validation/table.js";

const tableRouter = Router();

tableRouter.get("/", getTables);
tableRouter.post(
  "/",
  CheckAuth,
  isAdmin,
  validateBodySchema(createTableSchema),
  createTable,
);
tableRouter.put(
  "/:id",
  CheckAuth,
  isAdmin,
  validateBodySchema(updateTableSchema),
  updateTable,
);
tableRouter.delete("/:id", CheckAuth, isAdmin, deleteTable);

export default tableRouter;
