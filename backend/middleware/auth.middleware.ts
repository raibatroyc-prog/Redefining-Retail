import {
  createMiddleware,
} from "@tanstack/react-start";

import {
  getRequest,
} from "@tanstack/react-start/server";

import {
  createClient,
} from "@supabase/supabase-js";

import type {
  Database,
} from "../types/database.types";


function isNewSupabaseApiKey(
  value: string
): boolean {

  return (
    value.startsWith(
      "sb_publishable_"
    ) ||
    value.startsWith(
      "sb_secret_"
    )
  );

}


function createSupabaseFetch(
  supabaseKey: string
): typeof fetch {

  return (
    input,
    init
  ) => {

    const headers =
      new Headers(
        typeof Request !==
          "undefined" &&
        input instanceof Request
          ? input.headers
          : undefined
      );


    if (init?.headers) {

      new Headers(
        init.headers
      ).forEach(
        (
          value,
          key
        ) => {

          headers.set(
            key,
            value
          );

        }
      );

    }


    if (
      isNewSupabaseApiKey(
        supabaseKey
      ) &&
      headers.get(
        "Authorization"
      ) ===
        `Bearer ${supabaseKey}`
    ) {

      headers.delete(
        "Authorization"
      );

    }


    headers.set(
      "apikey",
      supabaseKey
    );


    return fetch(
      input,
      {
        ...init,
        headers,
      }
    );

  };

}


export const attachSupabaseAuth =
  createMiddleware({
    type: "function",
  }).server(
    async ({ next }) => {

      const SUPABASE_URL =
        process.env.SUPABASE_URL;


      const SUPABASE_PUBLISHABLE_KEY =
        process.env
          .SUPABASE_PUBLISHABLE_KEY;


      if (
        !SUPABASE_URL ||
        !SUPABASE_PUBLISHABLE_KEY
      ) {

        throw new Error(
          "Missing Supabase environment variables."
        );

      }


      const request =
        getRequest();


      if (!request?.headers) {

        throw new Error(
          "Unauthorized: No request headers available"
        );

      }


      const authHeader =
        request.headers.get(
          "authorization"
        );


      if (!authHeader) {

        throw new Error(
          "Unauthorized: No authorization header provided"
        );

      }


      if (
        !authHeader.startsWith(
          "Bearer "
        )
      ) {

        throw new Error(
          "Unauthorized: Only Bearer tokens are supported"
        );

      }


      const token =
        authHeader.replace(
          "Bearer ",
          ""
        );


      if (!token) {

        throw new Error(
          "Unauthorized: No token provided"
        );

      }


      const supabase =
        createClient<Database>(
          SUPABASE_URL,
          SUPABASE_PUBLISHABLE_KEY,
          {

            global: {

              fetch:
                createSupabaseFetch(
                  SUPABASE_PUBLISHABLE_KEY
                ),

              headers: {

                Authorization:
                  `Bearer ${token}`,

              },

            },

            auth: {

              storage:
                undefined,

              persistSession:
                false,

              autoRefreshToken:
                false,

            },

          }
        );


      const {
        data,
        error,
      } =
        await supabase.auth.getClaims(
          token
        );


      if (
        error ||
        !data?.claims
      ) {

        throw new Error(
          "Unauthorized: Invalid token"
        );

      }


      if (
        !data.claims.sub
      ) {

        throw new Error(
          "Unauthorized: No user ID found in token"
        );

      }


      return next({

        context: {

          supabase,

          userId:
            data.claims.sub,

          claims:
            data.claims,

        },

      });

    }
  );
