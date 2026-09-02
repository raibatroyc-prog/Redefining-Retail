import {
  getSupabaseAdmin,
} from "./supabase.service";


export async function getSuppliers(
  organizationId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("suppliers")
      .select("*")
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


export async function getSupplier(
  supplierId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("suppliers")
      .select("*")
      .eq(
        "id",
        supplierId
      )
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function createSupplier(
  organizationId: string,

  supplier: {

    name: string;

    category?: string;

    contactEmail?: string;

  }
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("suppliers")
      .insert({

        org_id:
          organizationId,

        name:
          supplier.name,

        category:
          supplier.category ??
          null,

        contact_email:
          supplier.contactEmail ??
          null,

      })
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function updateSupplier(
  supplierId: string,

  updates: {

    name?: string;

    category?: string;

    contactEmail?: string;

    status?: string;

    nextDelivery?: string;

    onTimeRate?: number;

  }
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("suppliers")
      .update({

        ...(updates.name !== undefined && {
          name: updates.name,
        }),

        ...(updates.category !== undefined && {
          category:
            updates.category,
        }),

        ...(updates.contactEmail !== undefined && {
          contact_email:
            updates.contactEmail,
        }),

        ...(updates.status !== undefined && {
          status:
            updates.status,
        }),

        ...(updates.nextDelivery !== undefined && {
          next_delivery:
            updates.nextDelivery,
        }),

        ...(updates.onTimeRate !== undefined && {
          on_time_rate:
            updates.onTimeRate,
        }),

      })
      .eq(
        "id",
        supplierId
      )
      .select()
      .single();


  if (error) {

    throw error;

  }


  return data;

}
