import {
  getSupabaseAdmin,
} from "./supabase.service";


export async function getOrganization(
  organizationId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("organizations")
      .select("*")
      .eq(
        "id",
        organizationId
      )
      .single();


  if (error) {

    throw error;

  }


  return data;

}


export async function getMembers(
  organizationId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase
      .from("org_members")
      .select(`
        id,
        user_id,
        role,
        created_at
      `)
      .eq(
        "org_id",
        organizationId
      );


  if (error) {

    throw error;

  }


  return data;

}


export async function createOrganization(
  name: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "create_organization",
      {
        _name: name,
      }
    );


  if (error) {

    throw error;

  }


  return data;

}


export async function seedDemoData(
  organizationId: string
) {

  const supabase =
    getSupabaseAdmin();


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "seed_demo_data",
      {
        _org:
          organizationId,
      }
    );


  if (error) {

    throw error;

  }


  return data;

}
