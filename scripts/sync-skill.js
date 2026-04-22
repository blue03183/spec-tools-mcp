import fs from "fs-extra";
import path from "path";

const ROOT = process.cwd();
const SOURCE = path.resolve(ROOT, "node_modules/dev-ai-kit/skills/common");
const TARGET = path.resolve(ROOT, ".github/skills");

async function run() {
  await fs.remove(TARGET);
  await fs.copy(SOURCE, TARGET);
  console.log("sync skills completed!!");
}

run();