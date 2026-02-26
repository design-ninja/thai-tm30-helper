import { cpSync } from "fs";

cpSync("static", "dist", { recursive: true });
console.log("Static files copied to dist/");
