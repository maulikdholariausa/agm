import assert from "node:assert/strict";
import { test } from "node:test";
import { executeTool, ForbiddenToolError } from "../src/execute.ts";
import type { Tool } from "../src/permissions.ts";

function fixture() {
  const called: string[] = [];
  const tools: Tool[] = [
    { name: "get_issue", description: "Read issue", execute: async () => {
      called.push("get_issue"); return { number: 42 };
    } },
    { name: "post_comment", description: "Post comment", execute: async () => {
      called.push("post_comment"); return { ok: true };
    } },
    { name: "merge_pull_request", description: "Merge PR", execute: async () => {
      called.push("merge_pull_request"); return { ok: true };
    } },
  ];
  return { tools, called };
}

test("viewer is allowed to execute read tool", async () => {
  const { tools, called } = fixture();
  assert.deepEqual(await executeTool("viewer", "get_issue", {}, tools), { number: 42 });
  assert.deepEqual(called, ["get_issue"]);
});

test("viewer cannot execute post_comment even if model requests it", async () => {
  const { tools, called } = fixture();
  await assert.rejects(executeTool("viewer", "post_comment", {}, tools), ForbiddenToolError);
  assert.deepEqual(called, []);
});

test("developer cannot execute merge_pull_request", async () => {
  const { tools, called } = fixture();
  await assert.rejects(executeTool("developer", "merge_pull_request", {}, tools), ForbiddenToolError);
  assert.deepEqual(called, []);
});

test("admin can execute merge_pull_request", async () => {
  const { tools, called } = fixture();
  await executeTool("admin", "merge_pull_request", {}, tools);
  assert.deepEqual(called, ["merge_pull_request"]);
});
