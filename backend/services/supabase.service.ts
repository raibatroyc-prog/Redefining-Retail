import {
  createClient,
} from "@supabase/supabase-js";

import type {
  Database,
} from "../types/database.types";


function createSupabaseAdminClient() {

  const SUPABASE_URL =
    process.env.SUPABASE_URL;


  const SUPABASE_SERVICE_ROLE_KEY =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;


  if (
    !SUPABASE_URL ||
    !SUPABASE_SERVICE_ROLE_KEY
  ) {

    throw new Error(
      "Missing Supabase server environment variables."
    );

  }


  return createClient<Database>(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    {

      auth: {

        persistSession:
          false,

        autoRefreshToken:
          false,

      },

    }
  );

}


let supabaseAdmin:
  ReturnType<
    typeof createSupabaseAdminClient
  > | undefined;


export function getSupabaseAdmin() {

  if (!supabaseAdmin) {

    supabaseAdmin =
      createSupabaseAdminClient();

  }


  return supabaseAdmin;

}
