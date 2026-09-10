// Build: bundle src/main.js and inline it, with src/styles.css, into the
// src/template.html shell to produce a single self-contained dist/index.html.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const BANNER =
  "<!-- Generated from src/ by build.mjs. Do not edit directly: edit src/ and run `npm run build`. -->\n";

const result = await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  format: "iife",
  target: "es2020",
  legalComments: "none",
  write: false,
});
const js = result.outputFiles[0].text;
const css = readFileSync("src/styles.css", "utf8");

let html = readFileSync("src/template.html", "utf8");
html = html.replace("<!--STYLES-->", () => `<style>\n${css.trimEnd()}\n</style>`);
html = html.replace("<!--SCRIPT-->", () => `<script>\n${js.trimEnd()}\n</script>`);
html = BANNER + html;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
console.log(`built dist/index.html (${html.length} bytes)`);
