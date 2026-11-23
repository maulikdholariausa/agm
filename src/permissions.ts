/** Weedmaps mock interview: do not hardcode the implementation in tests. */
export type Role = "viewer" | "developer" | "admin";

export type ToolName =
  | "get_issue"
  | "get_pull_request"
  | "list_files"
  | "post_comment"
  | "merge_pull_request"
  | "delete_branch";

export interface Tool {
  name: ToolName;
  description: string;
  execute(args: unknown): Promise<unknown>;
}

export function getAllowedTools(role: Role, tools: Tool[]): Tool[] {
  // TODO: filter by role. Current implementation is deliberately insecure.
  return tools;
}
