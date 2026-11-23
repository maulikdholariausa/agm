import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { handleIssueEvent } from "../src/handler.ts";
import type { AgentClient, AgentRequest, GitHubClient, IssueEvent } from "../src/types.ts";

const instructionFile = fileURLToPath(new URL("../instructions/issue-triage.md", import.meta.url));
const baseEvent: IssueEvent = {
  action: "opened", deliveryId: "delivery-1", repo: "weedmaps/checkout",
  issueNumber: 42, updatedAt: "2026-11-22T10:00:00Z",
};

function fixture() {
  const comments: string[] = [];
  const requests: AgentRequest[] = [];
  const github: GitHubClient = {
    async getIssue(_repo, number) {
      return {
        number, title: "Timeout on checkout", body: "Checkout sometimes times out.",
        updatedAt: baseEvent.updatedAt,
      };
    },
    async postIssueComment(_repo, _number, text) { comments.push(text); },
  };
  const agent: AgentClient = {
    async *query(req) {
      requests.push(req);
      yield { type: "assistant", text: "Investigating" } as const;
      yield { type: "result", subtype: "success", result: "Investigate connection pool saturation." } as const;
    },
  };
  return { comments, requests, deps: { github, agent, instructionFile } };
}

test("new issue gets one triage comment using Markdown instructions", async () => {
  const f = fixture();
  await handleIssueEvent(baseEvent, f.deps);
  assert.equal(f.comments.length, 1);
  assert.match(f.requests[0].systemPrompt, /Issue triage agent/);
  assert.match(f.requests[0].task, /Timeout on checkout/);
});

test("closed issues do not invoke the agent", async () => {
  const f = fixture();
  await handleIssueEvent({ ...baseEvent, action: "closed" }, f.deps);
  assert.equal(f.comments.length, 0);
  assert.equal(f.requests.length, 0);
});

test("same webhook redelivered does not produce another comment", async () => {
  const f = fixture();
  await handleIssueEvent(baseEvent, f.deps);
  await handleIssueEvent(baseEvent, f.deps);
  assert.equal(f.comments.length, 1, "should publish at most one comment per issue revision");
});

test("different delivery IDs for the same issue revision are deduplicated", async () => {
  const f = fixture();
  await handleIssueEvent(baseEvent, f.deps);
  await handleIssueEvent({ ...baseEvent, action: "edited", deliveryId: "delivery-2" }, f.deps);
  assert.equal(f.comments.length, 1, "dedupe by logical revision, not webhook delivery ID");
});

test("concurrent delivery of the same issue revision posts once", async () => {
  const f = fixture();
  await Promise.all([
    handleIssueEvent(baseEvent, f.deps),
    handleIssueEvent({ ...baseEvent, deliveryId: "delivery-concurrent" }, f.deps),
  ]);
  assert.equal(f.comments.length, 1, "claim must be atomic across concurrent handlers");
});

test("new issue revision gets a fresh triage comment", async () => {
  const f = fixture();
  await handleIssueEvent(baseEvent, f.deps);
  await handleIssueEvent({ ...baseEvent, deliveryId: "delivery-3", updatedAt: "2026-11-22T11:00:00Z" }, f.deps);
  assert.equal(f.comments.length, 2);
});

test("failure releases the claim so the issue can be retried", async () => {
  const f = fixture();
  f.deps.agent = {
    async *query() {
      yield { type: "result", subtype: "error", message: "temporary failure" } as const;
    },
  };

  await assert.rejects(() => handleIssueEvent(baseEvent, f.deps), /temporary failure/);
  f.deps.agent = {
    async *query(req) {
      yield { type: "result", subtype: "success", result: "Retry succeeded." } as const;
    },
  };
  await handleIssueEvent(baseEvent, f.deps);
  assert.equal(f.comments.length, 1);
});
