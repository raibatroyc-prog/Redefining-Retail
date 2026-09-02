import {
  createMiddleware,
} from "@tanstack/react-start";

import {
  renderErrorPage,
} from "../utils/error-page";


export const errorMiddleware =
  createMiddleware().server(
    async ({ next }) => {

      try {

        return await next();

      } catch (error) {

        if (
          error !== null &&
          typeof error === "object" &&
          "statusCode" in error
        ) {

          throw error;

        }


        console.error(
          "Backend error:",
          error
        );


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
