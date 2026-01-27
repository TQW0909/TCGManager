export type ProductType = "single_card" | "sealed_product";
export type CashFlowType =
  | "purchase"
  | "sale"
  | "fee"
  | "shipping"
  | "other_income"
  | "withdrawal";

export type ConditionCode = "NM" | "LP" | "MP" | "HP" | "DMG" | "SEALED" | null;

export interface Profile {
  id: string;
  display_name: string | null;
  default_currency: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  type: ProductType;
  name: string;
  game: string | null;
  set_name: string | null;
  set_code: string | null;
  condition: ConditionCode;
  sku: string | null;
  external_id: string | null;
  created_at: string;
}

export interface InventoryLot {
  id: string;
  user_id: string;
  product_id: string;
  quantity_total: number;
  quantity_available: number;
  purchase_date: string;
  purchase_price_total: number;
  fees_total: number | null;
  shipping_total: number | null;
  created_at: string;
}

export interface SalesOrder {
  id: string;
  user_id: string;
  platform: string | null;
  session_name: string | null;
  order_date: string;
  buyer_handle: string | null;
  shipping_charged: number | null;
  shipping_cost: number | null;
  platform_fees: number | null;
  other_fees: number | null;
  created_at: string;
}

export interface SalesOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  inventory_lot_id: string | null;
  quantity: number;
  price_each: number;
  created_at: string;
}

export interface CashFlow {
  id: string;
  user_id: string;
  type: CashFlowType;
  related_order_id: string | null;
  related_lot_id: string | null;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}
