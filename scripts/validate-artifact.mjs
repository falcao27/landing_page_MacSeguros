import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { staticRouteDefinitions } from "../src/config/static-routes.js";
const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicRoot = resolve(projectRoot, "src/public");
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");
const sourceHtmlPath = resolve(publicRoot, "index.html");
const mainScriptPath = resolve(publicRoot, "assets/js/main.js");
const siteConfigPath = resolve(publicRoot, "assets/js/site-config.js");

const [source, manifest, sourceHtml, mainScript, siteConfig] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
  readFile(sourceHtmlPath, "utf8"),
  readFile(mainScriptPath, "utf8"),
  readFile(siteConfigPath, "utf8"),
]);
JSON.parse(manifest);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

const fetchFromWorker = (pathname, init) =>
  workerModule.default.fetch(new Request(`https://macseguros.test${pathname}`, init), {}, {});

for (const route of staticRouteDefinitions) {
  const response = await fetchFromWorker(route.pathname);
  assert.equal(response.status, 200, `${route.pathname} deve responder com status 200`);
  assert.equal(response.headers.get("content-type"), route.contentType);
  assert.equal(response.headers.get("cache-control"), route.cacheControl);
}

const homeResponse = await fetchFromWorker("/");
const html = await homeResponse.text();
assert.match(html, /Proteção sob medida/);
assert.equal(html, sourceHtml, "O HTML publicado deve ser idêntico ao HTML que abre localmente");
assert.match(html, /<link rel="stylesheet" href="\.\/assets\/css\/main\.css\?v=13">/);
assert.match(html, /<script src="\.\/assets\/js\/site-config\.js\?v=13" defer><\/script>/);
assert.match(html, /<script src="\.\/assets\/js\/main\.js\?v=13" defer><\/script>/);
assert.match(html, /<button class="product reveal" type="button" data-insurance="auto"/);
assert.match(html, /<dialog class="insurance-modal" id="insurance-modal"/);
assert.doesNotMatch(html, /<a class="product/);
assert.doesNotMatch(html, /<style>|<script>(?!<\/script>)/);
assert.doesNotMatch(html, /{{[^}]+}}/);
assert.doesNotMatch(html, /(?:href|src)="\/assets\//, "Os assets devem usar caminhos relativos");
assert.doesNotMatch(mainScript, /^\s*(?:import|export)\s/m, "O JavaScript local não deve depender de módulos ESM");
assert.match(html, /<body data-whatsapp-phone="\d{12,15}">/);
assert.doesNotMatch(siteConfig, /whatsappPhone/, "O telefone deve ter uma única fonte no HTML");
assert.match(siteConfig, /Olá, quero uma cotação personalizada\./);
assert.match(mainScript, /modal\.showModal\(\)/);
assert.match(mainScript, /insurance-auto\.jpg/);
assert.equal((html.match(/class="partner-logo"/g) ?? []).length, 25);
assert.match(html, /alt="Yelum Seguradora"/);
assert.match(mainScript, /initializePartnersCarousel/);
assert.match(html, /href="https:\/\/www\.instagram\.com\/macseguros2026"/);
assert.match(html, /href="mailto:contato@macseguros\.com\.br"/);
assert.match(html, /class="site-footer"/);
assert.match(html, /class="whatsapp-float"/);
assert.match(html, /class="whatsapp-float"[^>]+data-whatsapp="quote"/);

const localAssetPaths = [...html.matchAll(/(?:href|src)="(\.\/assets\/[^"?]+)(?:\?[^" ]*)?"/g)]
  .map(([, assetPath]) => resolve(publicRoot, assetPath));
assert.ok(localAssetPaths.length >= 5, "O HTML deve referenciar os assets locais esperados");
await Promise.all(localAssetPaths.map((assetPath) => access(assetPath)));

const indexResponse = await fetchFromWorker("/index.html");
assert.equal(indexResponse.status, 200);
assert.equal(await indexResponse.text(), sourceHtml);

const imageResponse = await fetchFromWorker("/assets/images/partners/bradesco.png");
const imageBytes = new Uint8Array(await imageResponse.arrayBuffer());
assert.deepEqual([...imageBytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.ok([4, 6].includes(imageBytes[25]), "Os logos das seguradoras devem possuir canal alfa");

const logoResponse = await fetchFromWorker("/assets/images/mac-seguros-logo.png");
const logoBytes = new Uint8Array(await logoResponse.arrayBuffer());
assert.deepEqual([...logoBytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.ok([4, 6].includes(logoBytes[25]), "A logo deve possuir canal alfa");

const brandResponse = await fetchFromWorker("/assets/images/mac-seguros-brand.png");
const brandBytes = new Uint8Array(await brandResponse.arrayBuffer());
assert.deepEqual([...brandBytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.ok([4, 6].includes(brandBytes[25]), "A marca recortada deve possuir canal alfa");

const insuranceImageResponse = await fetchFromWorker("/assets/images/insurance-auto.jpg");
const insuranceImageBytes = new Uint8Array(await insuranceImageResponse.arrayBuffer());
assert.deepEqual([...insuranceImageBytes.slice(0, 3)], [255, 216, 255]);

const headResponse = await fetchFromWorker("/", { method: "HEAD" });
assert.equal(headResponse.status, 200);
assert.equal(await headResponse.text(), "");

const missingResponse = await fetchFromWorker("/nao-existe");
assert.equal(missingResponse.status, 404);

const methodResponse = await fetchFromWorker("/", { method: "POST" });
assert.equal(methodResponse.status, 405);
assert.equal(methodResponse.headers.get("allow"), "GET, HEAD");

console.log(`Artefato válido: ${staticRouteDefinitions.length} rotas e fluxos HTTP verificados.`);
