import {
  createClient,
} from "@supabase/supabase-js";

import type {
  Database,
} from "../types/database.types";
import { getServerConfig } from "../config";


function createSupabaseAdminClient() {

  const config = getServerConfig();


  return createClient<Database>(
    config.supabaseUrl,
    config.supabaseServiceRoleKey,
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
