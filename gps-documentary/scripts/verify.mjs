import { build } from "esbuild";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = await build({ entryPoints: [join(root, "scripts/verify.ts")], bundle: true, write: false, format: "esm", platform: "node", loader: { ".json": "json", ".tsx": "tsx" }, logLevel: "error" });
await import("data:text/javascript;base64," + Buffer.from(out.outputFiles[0].text).toString("base64"));
