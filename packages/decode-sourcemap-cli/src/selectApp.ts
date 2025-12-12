import path from "path";
import fs from "fs";
import inquirer from "inquirer";

interface SelectAppResult {
  root: string;
  targetApp: string;
  dist: string;
}

function findWorkspaceRoot(): string {
  let current = process.cwd();

  while (true) {
    const workspaceFile = path.join(current, "pnpm-workspace.yaml");
    if (fs.existsSync(workspaceFile)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // reached filesystem root
      return process.cwd();
    }
    current = parent;
  }
}

export async function selectApp(): Promise<SelectAppResult> {
  const root = findWorkspaceRoot();
  const appsDir = path.join(root, "apps");

  if (!fs.existsSync(appsDir)) {
    // graceful fallback: treat root as dist
    return {
      root,
      targetApp: path.basename(root),
      dist: path.join(root, "dist"),
    };
  }

  const entries = await fs.promises.readdir(appsDir, { withFileTypes: true });
  const apps = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (apps.length === 0) {
    return {
      root,
      targetApp: path.basename(root),
      dist: path.join(root, "dist"),
    };
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
