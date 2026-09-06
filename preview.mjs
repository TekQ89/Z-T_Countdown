import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
const routes = new Map([
  ["/", "index.html"], ["/index.html", "index.html"],
  ["/styles.css", "styles.css"], ["/countdown.js", "countdown.js"],
]);
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png", ".ttf": "font/ttf" };
createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  const filename = routes.get(pathname) || (/^\/assets\/[a-z0-9-]+\.(png|ttf)$/.test(pathname) ? pathname.slice(1) : null);
  if (!filename) { response.writeHead(404); response.end("Not found"); return; }
  try {
    const body = await readFile(new URL(filename, import.meta.url));
    response.writeHead(200, { "Content-Type": types[extname(filename)], "Cache-Control": "no-store" });
    response.end(body);
  } catch {
    response.writeHead(404); response.end("Datei konnte nicht geladen werden.");
  }
}).listen(4173, "127.0.0.1", () => console.log("Local: http://127.0.0.1:4173"));
