import type { Role, Tool, ToolName } from "./permissions.ts";

export class ForbiddenToolError extends Error {
  constructor(name: string) {
    super(`Not authorized to execute tool: ${name}`);
    this.name = "ForbiddenToolError";
  }
}

/** A model can request any tool name, including tools not shown in its prompt. */
export async function executeTool(
  role: Role,
  name: ToolName,
  args: unknown,
  tools: Tool[],
): Promise<unknown> {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);

  // TODO: independently enforce authorization before invoking the tool.
  return tool.execute(args);
}
