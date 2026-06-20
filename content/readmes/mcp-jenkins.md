---
title: "mcp-jenkins"
description: "🛠️ Drive Jenkins from Claude — trigger builds, watch pipelines, and manage CI/CD jobs & nodes"
---

A Jenkins MCP server with 38 tools for managing jobs, builds, nodes, views, and CI/CD workflows.

## Install

```bash
claude mcp add --transport stdio --scope user jenkins \
  --env MCP_JENKINS_URL=https://your-jenkins.com \
  --env MCP_JENKINS_USER=your_username \
  --env MCP_JENKINS_API_TOKEN=your_token \
  -- npx --yes @kud/mcp-jenkins@latest
```

## Development

```bash
npm install
npm run build:watch   # Terminal 1: rebuild on changes
npm run inspect:dev   # Terminal 2: test with the MCP inspector
```

Other scripts: `npm run build`, `npm run dev`, `npm start`, `npm run typecheck`, `npm run clean`.
