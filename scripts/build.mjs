import { build } from "esbuild";

await build({
  entryPoints: [
    "src/popup/index.ts",
    "src/content/index.ts",
    "src/options/index.ts",
  ],
  outdir: "dist/scripts",
  outbase: "src",
  entryNames: "[dir]/[name]",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  logLevel: "info",
});
