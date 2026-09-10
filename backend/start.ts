import {
  createStart,
  createMiddleware,
} from "@tanstack/react-start";

import {
  ApiError,
} from "./api/request-context";

import {
  renderErrorPage,
} from "./utils/error-page";

import {
  attachSupabaseAuth,
} from "./middleware/auth.middleware";


const errorMiddleware =
  createMiddleware().server(
    async ({ next }) => {

      try {

        return await next();

      } catch (error) {

        if (error instanceof ApiError) {
          return new Response(
            JSON.stringify({
              error: error.message,
              details: error.details,
            }),
            {
              status: error.statusCode,
              headers: {
                "content-type": "application/json; charset=utf-8",
              },
            }
          );
        }

        if (
          error !== null &&
          typeof error === "object" &&
          "statusCode" in error
        ) {

          throw error;

        }


        console.error(error);


        return new Response(
          renderErrorPage(),
          {

            status: 500,

            headers: {

              "content-type":
                "text/html; charset=utf-8",

            },

          }
        );

      }

    }
  );


export const startInstance =
  createStart(() => ({

    functionMiddleware: [
      attachSupabaseAuth,
    ],

    requestMiddleware: [
      errorMiddleware,
    ],

  }));
