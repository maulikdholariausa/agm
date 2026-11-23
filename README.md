# Weedmaps AI Platform — Mock Coding Interview 2

## Agent tool permissions (TypeScript, Node.js)

This is an **intentionally incomplete** exercise. The tests are designed to expose a security bug. No live Claude or GitHub credentials are required.

### Run in GitHub Codespaces

From your `agm` repository's Codespace terminal:

```bash
cd exercises/tool-permissions
npm test
```

Requires Node.js >= 22.6 (the existing Codespaces Node 22 image works). If your Codespace is still on an older Node version, update Node first.

### Scenario

The harness offers six tools to AI agents:

- Read: `get_issue`, `get_pull_request`, `list_files`
- Write: `post_comment`
- Admin: `merge_pull_request`, `delete_branch`

Roles:

| Role | Allowed |
| --- | --- |
| viewer | read |
| developer | read + write |
| admin | read + write + admin |

### Tasks

1. Inspect `src/permissions.ts`, `src/execute.ts`, and the tests.
2. Implement `getAllowedTools(role, tools)` so only permitted tools are exposed to the model.
3. Implement the execution-boundary permission check in `executeTool` so the model cannot bypass filtering by requesting a forbidden tool directly.
4. Run `npm test` and explain how you would adapt this for real GitHub repository permissions and per-resource access.

**Do not confuse hiding a tool from the model with enforcing authorization at execution time.**

### Evaluation criteria

Correctness, deny-by-default behavior, maintainability, failure behavior, and test quality. Bonus: What if a user is an admin in one repository but only a viewer in another?
