import path from "path";
import fs from "fs";
import inquirer from "inquirer";

interface SelectAppResult {
  /** Workspace root (pnpm-workspace.yaml location) */
  workspaceRoot: string;

  /** Selected app name (directory name) */
  appName: string;

  /** Absolute path to the selected app root */
  appRoot: string;
}

/**
 * Fallback app selector for monorepo environments.
 *
 * Purpose:
 * - Provide a reasonable UX when no explicit config is provided
 * - ONLY decides "which app", never "where the build output is"
 *
 * Behavior:
 * - If no /apps directory exists → treat workspace root as single app
 * - If /apps exists but empty → treat workspace root as single app
 * - If multiple apps exist → prompt user to select one
 */
export async function selectApp(): Promise<SelectAppResult> {
  const workspaceRoot = findWorkspaceRoot();
  const appsDir = path.join(workspaceRoot, "apps");

  // 1. No /apps → single app project
  if (!fs.existsSync(appsDir)) {
    return {
      workspaceRoot,
      appName: path.basename(workspaceRoot),
      appRoot: workspaceRoot,
    };
  }

  const entries = await fs.promises.readdir(appsDir, { withFileTypes: true });
  const apps = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  // 2. /apps exists but empty → single app
  if (apps.length === 0) {
    return {
      workspaceRoot,
      appName: path.basename(workspaceRoot),
      appRoot: workspaceRoot,
    };
  }

  // 3. Multiple apps → interactive selection
  const { selected } = await inquirer.prompt([
    {
      type: "list",
      name: "selected",
      message: "Select target app:",
      choices: apps,
    },
  ]);

  return {
    workspaceRoot,
    appName: selected,
    appRoot: path.join(appsDir, selected),
  };
}

/**
 * Find workspace root by walking up the directory tree
 * until pnpm-workspace.yaml is found.
 */
function findWorkspaceRoot(): string {
  let current = process.cwd();

  while (true) {
    if (fs.existsSync(path.join(current, "pnpm-workspace.yaml"))) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      // Reached filesystem root → fallback to cwd
      return process.cwd();
    }

    current = parent;
  }
}
