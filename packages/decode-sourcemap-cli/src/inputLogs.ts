
import inquirer from "inquirer";

export async function inputLogs(): Promise<string[]> {
  const { logs } = await inquirer.prompt([
    {
      type: "editor",
      name: "logs",
      message: "Paste your logs (save & close):",
    },
  ]);

  if (!logs) return [];

  return logs
    .split("\n")
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);
}
