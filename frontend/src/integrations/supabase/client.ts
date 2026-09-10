import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import {
  brokeredPreviewStorage,
  isPreviewAuthEnabled,
} from "./previewAuthStorage";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const previewAuthEnabled = isPreviewAuthEnabled();

export const supabase =
  url && key
    ? createClient<Database>(url, key, {
        auth: {
          storage: previewAuthEnabled ? brokeredPreviewStorage : undefined,
          persistSession: true,
          autoRefreshToken: true,
        },
      })
    : null;
