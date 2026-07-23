import { MenuItem } from "../models/menuItem.js";
import {
  KIDS_MENU_PRICE,
  KIDS_MENU_ALLOWED_CATEGORIES,
} from "../config/constants.js";
import { CreateOrderInput } from "../validation/order.js";

// Vérifie que les items marqués isKidsMenu appartiennent bien à une catégorie autorisée,
// et FORCE leur prix à 500 DA peu importe ce que le client a envoyé.
export async function enforceKidsMenuPricing(items: CreateOrderInput["items"]) {
  const kidsItems = items.filter((item) => item.isKidsMenu);
  if (kidsItems.length === 0) return;

  const menuItemIds = [...new Set(kidsItems.map((item) => item.menuItemId))];

  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } }).populate(
    "category",
  );

  const categoryByItemId = new Map(
    menuItems.map((mi) => [
      mi._id.toString(),
      (mi.category as any)?.name as string,
    ]),
  );

  for (const item of kidsItems) {
    const categoryName = categoryByItemId.get(item.menuItemId);

    if (!categoryName || !KIDS_MENU_ALLOWED_CATEGORIES.includes(categoryName)) {
      throw Object.assign(
        new Error(
          `"${item.name}" n'est pas éligible au Menu Kids (catégorie non autorisée)`,
        ),
        { statusCode: 400 },
      );
    }

    // Prix serveur, jamais celui du client
    item.unitPrice = KIDS_MENU_PRICE;
  }
}
