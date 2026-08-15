import { resolveStaticRoute } from "../../application/resolve-static-route.js";

export function createSiteWorker(routeDefinitions) {
  const routeTable = new Map(
    routeDefinitions.map((route) => [route.pathname, route]),
  );

  return {
    async fetch(request, env, ctx) {
      void env;
      void ctx;

      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed", {
          status: 405,
          headers: { allow: "GET, HEAD" },
        });
      }

      const pathname = new URL(request.url).pathname;
      const route = resolveStaticRoute(pathname, routeTable);

      if (!route) {
        return new Response("Not found", {
          status: 404,
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      }

      return new Response(request.method === "HEAD" ? null : route.body, {
        headers: {
          "content-type": route.contentType,
          "cache-control": route.cacheControl,
        },
      });
    },
  };
}

