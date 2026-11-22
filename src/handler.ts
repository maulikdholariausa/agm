import { loadInstructions } from "./instructions.ts";
import { generateTriageComment } from "./agent.ts";
import type { AgentClient, GitHubClient, IssueEvent } from "./types.ts";

export type HandlerDeps = {
  github: GitHubClient;
  agent: AgentClient;
  instructionFile: string;
};

/**
 * Processes issue events from a webhook-style transport.
 * A transport can redeliver the same event or deliver different event IDs
 * referring to the same revision of an issue.
 */
export async function handleIssueEvent(event: IssueEvent, deps: HandlerDeps): Promise<void> {
  if (event.action === "closed") return;

  const issue = await deps.github.getIssue(event.repo, event.issueNumber);
  const instructions = await loadInstructions(deps.instructionFile);
  const response = await generateTriageComment(
    deps.agent,
    instructions,
    issue.title,
    issue.body
  );

  // BUG: Event redelivery can produce duplicate comments.
  await deps.github.postIssueComment(event.repo, event.issueNumber, response);
}
