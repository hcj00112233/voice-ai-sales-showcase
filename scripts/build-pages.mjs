import { cp, mkdir, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const staging = path.join(root, ".pages-build");
const output = path.join(root, "out");
const excluded = new Set([".git", ".next", ".pages-build", "node_modules", "out", "screenshots", "package-lock.json"]);

await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true });
for (const entry of await readdir(root)) {
  if (excluded.has(entry) || (entry.startsWith(".env") && entry !== ".env.example") || entry.endsWith(".tsbuildinfo")) continue;
  await cp(path.join(root, entry), path.join(staging, entry), { recursive: true });
}
await symlink(path.join(root, "node_modules"), path.join(staging, "node_modules"), "dir");
await rm(path.join(staging, "app", "api"), { recursive: true, force: true });
await writeFile(
  path.join(staging, "next.config.ts"),
  `import type { NextConfig } from "next";\nconst config: NextConfig = { poweredByHeader: false, devIndicators: false, output: "export", basePath: "/voice-ai-sales-showcase", trailingSlash: true };\nexport default config;\n`,
);

const build = spawnSync("npm", ["run", "build"], {
  cwd: staging,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_BASE_PATH: "/voice-ai-sales-showcase",
    NEXT_PUBLIC_STATIC_DEMO: "1",
  },
});
if (build.error) throw build.error;
if (build.status !== 0) process.exit(build.status ?? 1);

await rm(output, { recursive: true, force: true });
await cp(path.join(staging, "out"), output, { recursive: true });
await writeFile(path.join(output, ".nojekyll"), "");
console.log(`Static Pages site created at ${output}`);
