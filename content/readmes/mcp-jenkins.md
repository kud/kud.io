---
title: "mcp-jenkins"
description: "🛠️ Drive Jenkins from Claude — trigger builds, watch pipelines, and manage CI/CD jobs & nodes"
hasDocs: true
---

## Features

- **38 tools** — covers ~95% of the Jenkins API: jobs, builds, nodes, views, queue, plugins, and system operations
- **Bearer token auth** — supports both classic API token and modern bearer token authentication
- **Multiple instances** — connect to several Jenkins servers simultaneously using comma-separated env vars
- **Pipeline awareness** — retrieve stage-by-stage pipeline status, console logs, test results, and build artefacts
- **Node management** — list agents, toggle nodes online/offline, and inspect system info without leaving your AI client
- **Zero-install usage** — run directly via `npx --yes @kud/mcp-jenkins@latest` with no local setup required

## Install

```sh
npm install -g @kud/mcp-jenkins
```

Or use without installing via `npx` (see Usage below).

## Usage

Add the server to your MCP client config. The recommended approach uses environment variables:

```json
{
  "mcpServers": {
    "jenkins": {
      "command": "npx",
      "args": ["--yes", "@kud/mcp-jenkins@latest"],
      "env": {
        "MCP_JENKINS_URL": "https://pipeline.yourcompany.com",
        "MCP_JENKINS_USER": "your_username",
        "MCP_JENKINS_API_TOKEN": "your_api_token"
      }
    }
  }
}
```

For bearer token authentication, replace the env block with:

```json
"env": {
  "MCP_JENKINS_URL": "https://pipeline.yourcompany.com",
  "MCP_JENKINS_BEARER_TOKEN": "your_bearer_token"
}
```
