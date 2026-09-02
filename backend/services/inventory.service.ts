import {
  getSupabaseAdmin,
} from "./supabase.service";


export async function getProducts(
  organizationId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .select(`
        *,
        suppliers (
          id,
          name,
          category,
          status
        )
      `)
      .eq(
        "org_id",
        organizationId
      )
      .order(
        "name",
        {
          ascending: true,
        }
      );


  if (error) {

    throw error;

  }


  return data;

}


export async function getProduct(
  productId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .select(`
        *,
        suppliers (
          id,
          name,
          category
        )
      `)
      .eq(
        "id",
        productId
      )
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function createProduct(
  product: {

    organizationId: string;

    sku: string;

    name: string;

    brand?: string;

    department?: string;

    aisle?: string;

    stock?: number;

    capacity?: number;

    velocity?:
      | "High"
      | "Medium"
      | "Low";

    demandTrend?: number;

    expiresAt?: string;

    unitCost?: number;

    supplierId?: string;

  }
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("products")
      .insert({

        org_id:
          product.organizationId,

        sku:
          product.sku,

        name:
          product.name,

        brand:
          product.brand ?? null,

        department:
          product.department ?? null,

        aisle:
          product.aisle ?? null,

        stock:
          product.stock ?? 0,

        capacity:
          product.capacity ?? 0,

        velocity:
          product.velocity ?? "Medium",

        demand_trend:
          product.demandTrend ?? 0,

        expires_at:
          product.expiresAt ?? null,

        unit_cost:
          product.unitCost ?? 0,

        supplier_id:
          product.supplierId ?? null,

      })
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function addStockMovement(
  organizationId: string,

  productId: string,

  type:
    | "sale"
    | "receipt"
    | "waste"
    | "adjustment",

  quantity: number,

  userId: string,

  note?: string
) {

  if (quantity <= 0) {

    throw new Error(
      "Quantity must be greater than zero."
    );

  }


  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("stock_movements")
      .insert({

        org_id:
          organizationId,

        product_id:
          productId,

        type,

        qty:
          quantity,

        actor_id:
          userId,

        note:
          note ?? null,

      })
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function getStockMovements(
  organizationId: string,

  productId?: string
) {

  const supabase =
    getSupabaseAdmin();


  let query =
    supabase
      .from("stock_movements")
      .select("*")
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


  if (productId) {

    query =
      query.eq(
        "product_id",
        productId
      );

  }


  const {
    data,
    error,
  } =
    await query;


  if (error) {

    throw error;

  }


  return data;

}
