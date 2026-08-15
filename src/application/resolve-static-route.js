export function resolveStaticRoute(pathname, routeTable) {
  return routeTable.get(pathname) ?? null;
}

