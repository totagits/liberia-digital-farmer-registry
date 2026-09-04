import cp from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const outDir = path.resolve("out-static");
if (!fs.existsSync(outDir)) {
  console.error("out-static directory does not exist. Run npm run build:static first.");
  process.exit(1);
}

const tmp = path.join(os.tmpdir(), `dfr_ghpages_${Date.now()}`);
fs.cpSync(outDir, tmp, { recursive: true });

function run(cmd, cwd = tmp) {
  console.log(`[Deploy] > ${cmd}`);
  cp.execSync(cmd, { cwd, stdio: "inherit" });
}

try {
  run("git init -b gh-pages");
  run('git config user.name "totagits"');
  run('git config user.email "tis@totaggroup.com"');
  run("git add -A");
  run('git commit -m "Deploy Liberia Digital Farmer Registry with multi-role demo portal"');
  run("git remote add origin https://github.com/totagits/liberia-digital-farmer-registry.git");
  run("git push origin gh-pages --force");
  console.log("=== Deployment to origin/gh-pages completed successfully ===");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
