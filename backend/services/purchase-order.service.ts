import {
  getSupabaseAdmin,
} from "./supabase.service";


export async function getPurchaseOrders(
  organizationId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("purchase_orders")
      .select(`
        *,
        suppliers (
          id,
          name,
          category
        ),
        purchase_order_items (
          id,
          product_id,
          qty,
          unit_cost
        )
      `)
      .eq(
        "org_id",
        organizationId
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );


  if (error) {

    throw error;

  }


  return data;

}


export async function createPurchaseOrder(
  organizationId: string,

  supplierId: string,

  userId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("purchase_orders")
      .insert({

        org_id:
          organizationId,

        supplier_id:
          supplierId,

        created_by:
          userId,

        status:
          "draft",

        total:
          0,

      })
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function addPurchaseOrderItem(
  purchaseOrderId: string,

  productId: string,

  quantity: number,

  unitCost: number
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("purchase_order_items")
      .insert({

        po_id:
          purchaseOrderId,

        product_id:
          productId,

        qty:
          quantity,

        unit_cost:
          unitCost,

      })
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function updatePurchaseOrderStatus(
  purchaseOrderId: string,

  status:
    | "draft"
    | "sent"
    | "received"
    | "cancelled"
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("purchase_orders")
      .update({
        status,
      })
      .eq(
        "id",
        purchaseOrderId
      )
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}
