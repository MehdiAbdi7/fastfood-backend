import { NextFunction, Request, Response } from "express";
import { Table } from "../models/table.js";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import { CreateTableInput, UpdateTableInput } from "../validation/table.js";

export async function createTable(
  req: Request<{}, {}, CreateTableInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const created = await Table.create(req.body);
    successResponse(
      res,
      created,
      "Table créée avec succès",
      StatusCodes.CREATED,
    );
  } catch (error) {
    next(error);
  }
}

export async function getTables(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tables = await Table.find().sort({ tableN: 1 });
    successResponse(res, tables, "Tables récupérées avec succès");
  } catch (error) {
    next(error);
  }
}

export async function updateTable(
  req: Request<{ id: string }, {}, UpdateTableInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const updated = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      errorResponse(res, "Table introuvable", StatusCodes.NOT_FOUND);
      return;
    }

    successResponse(res, updated, "Table mise à jour avec succès");
  } catch (error) {
    next(error);
  }
}

export async function deleteTable(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      errorResponse(res, "Table introuvable", StatusCodes.NOT_FOUND);
      return;
    }

    // On empêche la suppression d'une table encore occupée par une commande en cours
    if (table.status === "occupied") {
      errorResponse(
        res,
        "Impossible de supprimer une table occupée",
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    await table.deleteOne();
    successResponse(res, null, "Table supprimée avec succès");
  } catch (error) {
    next(error);
  }
}
