const textRoute = (pathname, sourcePath, contentType, cacheControl) => ({
  pathname,
  sourcePath,
  contentType,
  cacheControl,
  encoding: "utf8",
});

const scriptRoute = (filename) =>
  textRoute(
    `/assets/js/${filename}`,
    `src/public/assets/js/${filename}`,
    "text/javascript; charset=utf-8",
    "public, max-age=3600",
  );

const imageRoute = (filename, contentType = "image/png") => ({
  pathname: `/assets/images/${filename}`,
  sourcePath: `src/public/assets/images/${filename}`,
  contentType,
  cacheControl: "public, max-age=31536000, immutable",
  encoding: "binary",
});

const partnerLogoFiles = Object.freeze([
  "bradesco.png", "liberty.png", "porto.png", "allianz.png", "aig.png",
  "swiss.png", "metlife.png", "zurich.png", "ituran.png", "sura.png",
  "junto.png", "too.png", "azul.png", "tokio-marine.png", "mapfre.png",
  "chubb.png", "hdi.png", "sompo.png", "akad.png", "mitsui-sumitomo.png",
  "pottencial.png", "alfa.png", "suhai.png", "berkley.png", "yelum.png",
]);

export const staticRouteDefinitions = Object.freeze([
  textRoute("/", "src/public/index.html", "text/html; charset=utf-8", "public, max-age=300"),
  textRoute("/index.html", "src/public/index.html", "text/html; charset=utf-8", "public, max-age=300"),
  textRoute(
    "/assets/css/main.css",
    "src/public/assets/css/main.css",
    "text/css; charset=utf-8",
    "public, max-age=3600",
  ),
  scriptRoute("main.js"),
  scriptRoute("site-config.js"),
  imageRoute("mac-seguros-brand.png"),
  imageRoute("mac-seguros-logo.png"),
  ...partnerLogoFiles.map((filename) => imageRoute(`partners/${filename}`)),
  imageRoute("insurance-auto.jpg", "image/jpeg"),
  imageRoute("insurance-home.jpg", "image/jpeg"),
  imageRoute("insurance-life.jpg", "image/jpeg"),
  imageRoute("insurance-business.jpg", "image/jpeg"),
]);
