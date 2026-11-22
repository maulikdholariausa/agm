export type IssueEvent = {
  action: "opened" | "edited" | "closed";
  deliveryId: string;
  repo: string;
  issueNumber: number;
  updatedAt: string;
};

export type GitHubIssue = {
  number: number;
  title: string;
  body: string;
  updatedAt: string;
};

export interface GitHubClient {
  getIssue(repo: string, number: number): Promise<GitHubIssue>;
  postIssueComment(repo: string, number: number, text: string): Promise<void>;
}

export type AgentRequest = {
  systemPrompt: string;
  task: string;
  maxTurns: number;
};

export type AgentMessage =
  | { type: "assistant"; text: string }
  | { type: "result"; subtype: "success"; result: string }
  | { type: "result"; subtype: "error"; message: string };

// An adapter around Claude Agent SDK's streamed responses.
// In this case study it is injected and mocked: no model/API account needed.
export interface AgentClient {
  query(request: AgentRequest): AsyncIterable<AgentMessage>;
}
