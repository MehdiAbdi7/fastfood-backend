import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { Order } from "../models/order.js";
import { Table } from "../models/table.js";
import { StatusCodes } from "http-status-codes";
import { errorResponse, successResponse } from "../utils/responseFormatter.js";
import {
  AddItemsToOrderInput,
  CreateOrderInput,
  SetDeliveryFeeInput,
  UpdateOrderStatusInput,
} from "../validation/order.js";

// Convertit les items reçus de Zod (ids en string) vers le format attendu par Mongoose (ids en ObjectId)
function toOrderItems(items: CreateOrderInput["items"]) {
  return items.map((item) => ({
    ...item,
    menuItemId: new Types.ObjectId(item.menuItemId),
    selectedExtras: item.selectedExtras.map((extra) => ({
      ...extra,
      extraId: new Types.ObjectId(extra.extraId),
    })),
  }));
}

export async function createOrder(
  req: Request<{}, {}, CreateOrderInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = req.body;

    // Cas dine_in : on vérifie si la table a déjà une commande en cours
    if (data.type === "dine_in") {
      const table = await Table.findById(data.table);
      if (!table) {
        errorResponse(res, "Table introuvable", StatusCodes.NOT_FOUND);
        return;
      }

      if (table.currentOrderId) {
        const existingOrder = await Order.findOne({
          _id: table.currentOrderId,
          status: "pending",
        });

        // Fusion auto : la table est occupée par une commande pending -> on ajoute les items dedans
        if (existingOrder) {
          existingOrder.items.push(...toOrderItems(data.items));
          if (data.remark) existingOrder.remark = data.remark;
          await existingOrder.save();
          successResponse(
            res,
            existingOrder,
            "Items ajoutés à la commande existante de la table",
          );
          return;
        }
      }

      // Pas de commande en cours -> nouvelle commande + occupation de la table
      const newOrder = await Order.create(data);
      table.currentOrderId = newOrder._id;
      table.status = "occupied";
      await table.save();

      successResponse(
        res,
        newOrder,
        "Commande créée avec succès",
        StatusCodes.CREATED,
      );
      return;
    }

    // takeaway / delivery : toujours une commande indépendante
    const newOrder = await Order.create(data);
    successResponse(
      res,
      newOrder,
      "Commande créée avec succès",
      StatusCodes.CREATED,
    );
  } catch (error) {
    next(error);
  }
}

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { status, type } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const orders = await Order.find(filter)
      .populate("table")
      .sort({ createdAt: -1 });

    successResponse(res, orders, "Commandes récupérées avec succès");
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await Order.findById(req.params.id).populate("table");
    if (!order) {
      errorResponse(res, "Commande introuvable", StatusCodes.NOT_FOUND);
      return;
    }
    successResponse(res, order, "Commande récupérée avec succès");
  } catch (error) {
    next(error);
  }
}

// Ajout manuel d'items par le staff (takeaway/delivery/dine_in tant que la commande est pending)
export async function addItemsToOrder(
  req: Request<{ id: string }, {}, AddItemsToOrderInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      errorResponse(res, "Commande introuvable", StatusCodes.NOT_FOUND);
      return;
    }

    if (order.status !== "pending") {
      errorResponse(
        res,
        "Impossible de modifier une commande déjà terminée ou annulée",
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    order.items.push(...toOrderItems(req.body.items));
    await order.save();

    successResponse(res, order, "Items ajoutés avec succès");
  } catch (error) {
    next(error);
  }
}

// Le staff fixe le prix de livraison manuellement, une fois la commande reçue au dashboard
export async function setDeliveryFee(
  req: Request<{ id: string }, {}, SetDeliveryFeeInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      errorResponse(res, "Commande introuvable", StatusCodes.NOT_FOUND);
      return;
    }

    if (order.type !== "delivery") {
      errorResponse(
        res,
        "Cette commande n'est pas une livraison",
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    order.deliveryFee = req.body.deliveryFee;
    await order.save(); // le pre("save") recalcule totalPrice avec le deliveryFee inclus

    successResponse(res, order, "Prix de livraison mis à jour");
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(
  req: Request<{ id: string }, {}, UpdateOrderStatusInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      errorResponse(res, "Commande introuvable", StatusCodes.NOT_FOUND);
      return;
    }

    const newStatus = req.body.status;

    // On ne peut annuler une commande que tant qu'elle est encore pending
    if (newStatus === "cancelled" && order.status !== "pending") {
      errorResponse(
        res,
        "Impossible d'annuler une commande déjà en préparation ou terminée",
        StatusCodes.BAD_REQUEST,
      );
      return;
    }

    order.status = newStatus;
    await order.save();

    // La table n'est libérée qu'une fois la commande payée (completed), pas juste "prête"
    if (
      order.type === "dine_in" &&
      order.status === "completed" &&
      order.table
    ) {
      await Table.findByIdAndUpdate(order.table, {
        status: "free",
        currentOrderId: null,
      });
    }

    successResponse(res, order, "Statut de la commande mis à jour");
  } catch (error) {
    next(error);
  }
}

// Suivi public pour le client (sans authentification), infos limitées uniquement
export async function trackOrder(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const order = await Order.findById(req.params.id).select(
      "type status items.name items.quantity items.variantSelected createdAt",
    );

    if (!order) {
      errorResponse(res, "Commande introuvable", StatusCodes.NOT_FOUND);
      return;
    }

    successResponse(res, order, "Suivi de la commande récupéré avec succès");
  } catch (error) {
    next(error);
  }
}
