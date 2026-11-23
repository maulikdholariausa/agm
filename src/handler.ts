import { loadInstructions } from "./instructions.ts";
import { generateTriageComment } from "./agent.ts";
import type { AgentClient, GitHubClient, IssueEvent } from "./types.ts";

export type HandlerDeps = {
  github: GitHubClient;
  agent: AgentClient;
  instructionFile: string;
};

type CommentState = "in-progress" | "completed";

const commentStates = new WeakMap<GitHubClient, Map<string, CommentState>>();

function getCommentStates(github: GitHubClient): Map<string, CommentState> {
  let states = commentStates.get(github);
  if (!states) {
    states = new Map();
    commentStates.set(github, states);
  }
  return states;
}

/**
 * Processes issue events from a webhook-style transport.
 * A transport can redeliver the same event or deliver different event IDs
 * referring to the same revision of an issue.
 */
export async function handleIssueEvent(event: IssueEvent, deps: HandlerDeps): Promise<void> {
  if (event.action === "closed") return;

  const issue = await deps.github.getIssue(event.repo, event.issueNumber);
  const states = getCommentStates(deps.github);
  const revisionKey = `${event.repo}\0${event.issueNumber}\0${event.updatedAt}`;

  if (states.has(revisionKey)) return;

  states.set(revisionKey, "in-progress");

  try {
    const instructions = await loadInstructions(deps.instructionFile);
    const response = await generateTriageComment(
      deps.agent,
      instructions,
      issue.title,
      issue.body
    );

    await deps.github.postIssueComment(event.repo, event.issueNumber, response);
    states.set(revisionKey, "completed");
  } catch (error) {
    states.delete(revisionKey);
    throw error;
  }
}
