import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { resolveStaticRoute } from "../src/application/resolve-static-route.js";
import { staticRouteDefinitions } from "../src/config/static-routes.js";
import { createSiteWorker } from "../src/infrastructure/http/create-site-worker.js";

const projectRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(projectRoot, "dist");
const outputPath = resolve(distRoot, "server/index.js");

function serializeRoute(route, body) {
  const serializedBody = route.encoding === "binary"
    ? `decodeBase64(${JSON.stringify(body.toString("base64"))})`
    : JSON.stringify(body);

  return `  {
    pathname: ${JSON.stringify(route.pathname)},
    contentType: ${JSON.stringify(route.contentType)},
    cacheControl: ${JSON.stringify(route.cacheControl)},
    body: ${serializedBody},
  }`;
}

const pathnames = staticRouteDefinitions.map(({ pathname }) => pathname);
if (new Set(pathnames).size !== pathnames.length) {
  throw new Error("Existem rotas estáticas duplicadas.");
}

const serializedRoutes = await Promise.all(
  staticRouteDefinitions.map(async (route) => {
    const sourcePath = resolve(projectRoot, route.sourcePath);
    const body = await readFile(sourcePath, route.encoding === "binary" ? undefined : "utf8");
    return serializeRoute(route, body);
  }),
);

const output = `// Arquivo gerado por scripts/build.mjs. Edite os arquivos em src/.
${resolveStaticRoute.toString()}

${createSiteWorker.toString()}

function decodeBase64(value) {
  const raw = atob(value);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

const staticRoutes = [
${serializedRoutes.join(",\n")}
];

export default createSiteWorker(staticRoutes);
`;

await rm(distRoot, { recursive: true, force: true });
await mkdir(resolve(distRoot, "server"), { recursive: true });
await mkdir(resolve(distRoot, ".openai"), { recursive: true });
await Promise.all([
  writeFile(outputPath, output, "utf8"),
  cp(resolve(projectRoot, ".openai/hosting.json"), resolve(distRoot, ".openai/hosting.json")),
]);

console.log(`Build concluído em ${outputPath}`);
