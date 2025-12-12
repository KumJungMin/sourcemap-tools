
import path from "path";
import fs from "fs";
import inquirer from "inquirer";

function findWorkspaceRoot(): string {
  let current = process.cwd();

  while (true) {
    const workspaceFile = path.join(current, "pnpm-workspace.yaml");
    if (fs.existsSync(workspaceFile)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return process.cwd();
    }
    current = parent;
  }
}

export interface AppSelection {
  root: string;
  targetApp: string;
  dist: string;
}

export async function selectApp(): Promise<AppSelection> {
  const root = findWorkspaceRoot();
  const appsDir = path.join(root, "apps");

  if (!fs.existsSync(appsDir)) {
    console.error(`❌ apps directory not found at: ${appsDir}`);
    process.exit(1);
  }

  const apps = fs
    .readdirSync(appsDir)
    .filter((name) => {
      const full = path.join(appsDir, name);
      return fs.statSync(full).isDirectory();
    });

  if (apps.length === 0) {
    console.error("❌ No app folders found under apps/");
    process.exit(1);
  }

  const { selected } = await inquirer.prompt([
    {
      type: "list",
      name: "selected",
      message: "Select target app:",
      choices: apps,
    },
  ]);

  const dist = path.join(appsDir, selected, "dist");

  return {
    root,
    targetApp: selected,
    dist,
  };
}
