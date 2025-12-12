
import inquirer from "inquirer";

/**  
 * Prompt the user to input logs via an editor interface.
 * - The user can paste their logs into the editor that opens.
 * - After saving and closing the editor, the logs are processed.
 * - Returns an array of non-empty log lines.
 * */ 
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
