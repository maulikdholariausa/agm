import { readFile } from "node:fs/promises";

export async function loadInstructions(path: string): Promise<string> {
  const markdown = await readFile(path, "utf8");
  if (!markdown.trim()) throw new Error("Instruction file is empty");
  return markdown;
}
