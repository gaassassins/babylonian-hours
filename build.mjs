// Build: bundle src/main.js and inline it, with the self-hosted fonts and
// src/styles.css, into src/template.html to produce a single self-contained
// dist/index.html. The font files are copied to dist/fonts/ alongside it.
import { build } from "esbuild";
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";

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
const fontsCss = readFileSync("src/fonts.css", "utf8");
const css = readFileSync("src/styles.css", "utf8");

let html = readFileSync("src/template.html", "utf8");
html = html.replace(
  "<!--STYLES-->",
  () => `<style>\n${fontsCss.trimEnd()}\n\n${css.trimEnd()}\n</style>`,
);
html = html.replace("<!--SCRIPT-->", () => `<script>\n${js.trimEnd()}\n</script>`);
html = BANNER + html;

mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
cpSync("src/fonts", "dist/fonts", { recursive: true });
console.log(`built dist/index.html (${html.length} bytes) + dist/fonts/`);
