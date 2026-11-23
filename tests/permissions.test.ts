import assert from "node:assert/strict";
import { test } from "node:test";
import { getAllowedTools } from "../src/permissions.ts";
import type { Tool, ToolName } from "../src/permissions.ts";

const names: ToolName[] = [
  "get_issue", "get_pull_request", "list_files", "post_comment",
  "merge_pull_request", "delete_branch",
];
const tools: Tool[] = names.map((name) => ({
  name,
  description: name,
  execute: async () => ({ ok: true }),
}));
const allowedNames = (role: "viewer" | "developer" | "admin") =>
  getAllowedTools(role, tools).map((tool) => tool.name);

test("viewer can see only read tools", () => {
  assert.deepEqual(allowedNames("viewer"), names.slice(0, 3));
});

test("developer can also post comments", () => {
  assert.deepEqual(allowedNames("developer"), names.slice(0, 4));
});

test("admin can see all six tools", () => {
  assert.deepEqual(allowedNames("admin"), names);
});

test("does not modify the caller's tool array", () => {
  const before = [...tools];
  getAllowedTools("viewer", tools);
  assert.deepEqual(tools, before);
});
