import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deliverables } from "../lib/deliverables.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distClientDir = path.join(rootDir, "dist", "client");
const distServerWorker = path.join(rootDir, "dist", "server", "index.js");
const outDir = path.join(rootDir, "out-static");

// Base path for GitHub Pages, e.g. /liberia-digital-farmer-registry/
const rawBase = process.env.BASE_PATH || "/liberia-digital-farmer-registry/";
const BASE_PATH = rawBase.startsWith("/") ? rawBase : `/${rawBase}`;
const normalizedBasePath = BASE_PATH.endsWith("/") ? BASE_PATH : `${BASE_PATH}/`;
const baseWithoutSlash = normalizedBasePath.replace(/\/$/, "");

async function exportSite() {
  console.log(`[Export] Starting static export for base path: "${normalizedBasePath}"`);

  if (!fs.existsSync(distServerWorker)) {
    throw new Error(`Worker build not found at ${distServerWorker}. Run npx vinext build first.`);
  }

  // Clean and recreate output directory
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy client assets to output directory
  console.log("[Export] Copying client assets...");
  copyDir(distClientDir, outDir);

  // Also ensure public assets are copied
  const publicDir = path.join(rootDir, "public");
  if (fs.existsSync(publicDir)) {
    copyDir(publicDir, outDir);
  }

  // 2. Load worker
  const { default: worker } = await import(`file://${distServerWorker}?t=${Date.now()}`);

  const routes = [
    "/",
    "/map",
    "/about",
    "/platform",
    "/services",
    "/governance",
    "/dashboard",
    "/signin",
    ...deliverables.map((d) => `/deliverables/${d.slug}`),
  ];

  console.log(`[Export] Rendering ${routes.length} routes to static HTML...`);

  for (const route of routes) {
    const fullRoute = `${baseWithoutSlash}${route === "/" ? "" : route}`;
    const req = new Request(`http://localhost${fullRoute || "/"}`, {
      headers: {
        accept: "text/html",
        "oai-authenticated-user-email": "tis@totaggroup.com",
        "oai-authenticated-user-full-name": "Michael%20Gwoah%20(Ministry%20Administrator)",
        "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
      },
    });

    const res = await worker.fetch(
      req,
      {
        ASSETS: {
          fetch: async () => new Response("Not found", { status: 404 }),
        },
      },
      {
        waitUntil() {},
        passThroughOnException() {},
      }
    );

    if (res.status !== 200) {
      console.warn(`[Export] Warning: ${route} returned status ${res.status}`);
      continue;
    }

    let html = await res.text();

    // Rewrite paths in HTML for GitHub Pages subpath
    html = html.replaceAll('href="/assets/', `href="${baseWithoutSlash}/assets/`);
    html = html.replaceAll('src="/assets/', `src="${baseWithoutSlash}/assets/`);
    html = html.replaceAll('"/assets/', `"${baseWithoutSlash}/assets/`);
    html = html.replaceAll("'/assets/", `'${baseWithoutSlash}/assets/`);
    html = html.replaceAll(/url\(\/assets\//g, `url(${baseWithoutSlash}/assets/`);
    html = html.replaceAll(/url\(\/workspace\/[^)]*\/fonts\//g, `url(${baseWithoutSlash}/assets/_vinext_fonts/`);
    html = html.replaceAll(/href="\/workspace\/[^"]*\/fonts\//g, `href="${baseWithoutSlash}/assets/_vinext_fonts/`);

    // Rewrite internal navigation links
    html = html.replaceAll('href="/dashboard"', `href="${baseWithoutSlash}/dashboard/"`);
    html = html.replaceAll('href="/signin"', `href="${baseWithoutSlash}/signin/"`);
    html = html.replaceAll('href="/platform"', `href="${baseWithoutSlash}/platform/"`);
    html = html.replaceAll('href="/services"', `href="${baseWithoutSlash}/services/"`);
    html = html.replaceAll('href="/governance"', `href="${baseWithoutSlash}/governance/"`);
    html = html.replaceAll('href="/about"', `href="${baseWithoutSlash}/about/"`);
    html = html.replaceAll('href="/"', `href="${normalizedBasePath}"`);

    // Inject base href and meta tag
    const baseTag = `<base href="${normalizedBasePath}">`;
    html = html.replace(/<head([^>]*)>/i, `<head$1>\n    ${baseTag}`);

    // Determine output file path
    let targetFilePath;
    if (route === "/") {
      targetFilePath = path.join(outDir, "index.html");
    } else {
      const routeDir = path.join(outDir, route.replace(/^\//, ""));
      fs.mkdirSync(routeDir, { recursive: true });
      targetFilePath = path.join(routeDir, "index.html");
    }

    fs.writeFileSync(targetFilePath, html, "utf-8");
    console.log(`  ✓ ${route} -> ${path.relative(rootDir, targetFilePath)}`);
  }

  // 3. Patch CSS and JS files in outDir to use correct asset URLs
  patchCssFiles(path.join(outDir, "assets"));
  patchJsFiles(path.join(outDir, "assets"));

  // 4. Create .nojekyll
  fs.writeFileSync(path.join(outDir, ".nojekyll"), "", "utf-8");
  console.log("  ✓ Created .nojekyll");

  // 5. Create 404.html (copy of index.html with SPA redirect handling)
  const indexHtml = fs.readFileSync(path.join(outDir, "index.html"), "utf-8");
  const spa404Script = `
    <script>
      (function(l) {
        if (l.search[1] === '/' ) {
          var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&')
          }).join('?');
          window.history.replaceState(null, null,
              l.pathname.slice(0, -1) + decoded + l.hash
          );
        }
      }(window.location))
    </script>
  `;
  const html404 = indexHtml.replace("</head>", `${spa404Script}\n</head>`);
  fs.writeFileSync(path.join(outDir, "404.html"), html404, "utf-8");
  console.log("  ✓ Created 404.html");

  console.log(`[Export] Static site export complete! Output: ${path.relative(rootDir, outDir)}`);
}

function patchCssFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchCssFiles(fullPath);
    } else if (entry.name.endsWith(".css")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      content = content.replaceAll(/url\(\/workspace\/[^)]*\/fonts\//g, `url(${baseWithoutSlash}/assets/_vinext_fonts/`);
      content = content.replaceAll(/url\(\/assets\//g, `url(${baseWithoutSlash}/assets/`);
      fs.writeFileSync(fullPath, content, "utf-8");
    }
  }
}

function patchJsFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchJsFiles(fullPath);
    } else if (entry.name.endsWith(".js") || entry.name.endsWith(".mjs")) {
      let content = fs.readFileSync(fullPath, "utf-8");
      content = content.replaceAll('"/assets/', `"${baseWithoutSlash}/assets/`);
      content = content.replaceAll("'/assets/", `'${baseWithoutSlash}/assets/`);
      fs.writeFileSync(fullPath, content, "utf-8");
    }
  }
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

exportSite().catch((err) => {
  console.error("[Export] Failed:", err);
  process.exit(1);
});
