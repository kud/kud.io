---
title: "mcp-jenkins"
description: "🛠️ Drive Jenkins from Claude — trigger builds, watch pipelines, and manage CI/CD jobs & nodes"
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

### Tools

| Category                | Tools                                                                                                                                                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Job operations**      | `jenkins_list_jobs`, `jenkins_search_jobs`, `jenkins_get_job_status`, `jenkins_get_job_parameters`, `jenkins_enable_job`, `jenkins_disable_job`, `jenkins_delete_job`, `jenkins_get_job_config`, `jenkins_create_job`, `jenkins_update_job_config`, `jenkins_rename_job`, `jenkins_copy_job` |
| **Build operations**    | `jenkins_get_build_status`, `jenkins_get_recent_builds`, `jenkins_trigger_build`, `jenkins_stop_build`, `jenkins_delete_build`, `jenkins_replay_build`, `jenkins_get_console_log`, `jenkins_get_build_changes`, `jenkins_get_pipeline_stages`                                                |
| **Testing & artefacts** | `jenkins_get_test_results`, `jenkins_list_artifacts`, `jenkins_get_artifact`                                                                                                                                                                                                                 |
| **Queue management**    | `jenkins_get_queue`, `jenkins_cancel_queue`                                                                                                                                                                                                                                                  |
| **System & nodes**      | `jenkins_list_nodes`, `jenkins_get_node`, `jenkins_toggle_node_offline`, `jenkins_get_system_info`, `jenkins_get_version`, `jenkins_get_plugins`, `jenkins_quiet_down`, `jenkins_cancel_quiet_down`                                                                                          |
| **Views**               | `jenkins_list_views`, `jenkins_get_view`                                                                                                                                                                                                                                                     |
| **Instances & admin**   | `jenkins_list_instances`, `jenkins_safe_restart`                                                                                                                                                                                                                                             |

## Development

```sh
git clone https://github.com/kud/mcp-jenkins.git
cd mcp-jenkins
npm install
npm run dev
```

To test interactively with the MCP Inspector:

```sh
npm run inspect:dev
```
