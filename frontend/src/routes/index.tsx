import { createRoute, redirect } from "@tanstack/react-router";
import { rootRoute } from "@/routeTree.gen";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
