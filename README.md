# Mock Interview: GitHub Issue Agent Harness

**Scenario:** This is a tiny TypeScript/Node.js application that receives GitHub issue events, reads Markdown instructions, uses a *mocked* Claude Agent SDK adapter, and posts a triage comment.

**Your role:** Senior Software Engineer joining the AI Platform team. The interviewer asks you to investigate and fix duplicate comments on repeated GitHub webhook deliveries.

**Environment:** Node.js 22.6+; no packages, API keys, network, or GitHub account needed. TypeScript files run with Node's built-in type stripping. `npm test` runs tests. `npm run typecheck` is optional if TypeScript and Node type declarations are already installed.

## Your assignment (do not read past this before your first exploration)

We sometimes publish duplicate triage comments when the same issue event is delivered more than once. An issue may get a different `deliveryId` without any actual content revision. The harness should only publish one comment per **repository + issue + revision**, even under concurrent handlers. After a *genuine new revision*, the issue should be eligible for a fresh triage.

1. Explore the repo and explain its execution flow.
2. Run the tests and identify the defect.
3. Implement a minimal fix that passes the tests, plus tests for a new revision and failure recovery.
4. Explain the limitations of your solution, particularly across multiple Node processes and partial GitHub failures.

**Constraints:** Preserve Markdown instruction loading and agent streaming; do not use real GitHub or model credentials. Don't rewrite the project wholesale. Explain any assumptions you make.

**Interview note:** A process-local `Set` may pass simple tests, but a production answer also needs to discuss atomic state, idempotency across processes, and what happens when GitHub succeeds but local state recording fails. You're not expected to implement a database in this mock unless you choose to.

## Start here

```bash
npm test
cat package.json
find src tests instructions -type f
```

Do not assume this project is Weedmaps' actual interview repository; it is an independent practice exercise.

## Open in GitHub Codespaces

1. Create a new GitHub repository (e.g. `weedmaps-agent-mock`).
2. Upload all project files **including** `.devcontainer/devcontainer.json`, keeping their folder structure; or clone the new empty repository and copy the project files into it before committing and pushing.
3. In the GitHub repository, select **Code > Codespaces > Create codespace on main**.
4. The devcontainer provisions Node 22 and runs `npm test` during setup. The three intentionally failing tests are part of this coding exercise.

If pushing with git locally, run from the project directory (replace placeholders):

```bash
git init
git add .
git commit -m "Add agent harness practice exercise"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/weedmaps-agent-mock.git
git push -u origin main
```

No Claude or GitHub API credentials are needed; the adapter is mocked.
