# mcp-fullstack-esp — MCP server experiment for full stack development

An experiment from July 2025, built with Claude Code. It started from Cole Medin's open-source `mcp-crawl4ai-rag` server (MIT) and tried to turn it into an "MCP full stack developer": a knowledge base plus Product Requirements Prompt (PRP) templates that guide a coding agent to produce Next.js + Supabase apps. Most of the repo is Spanish documentation and example code, not a finished server.

## What it contains

- The upstream Python MCP server (`src/crawl4ai_mcp.py`) with tools to crawl pages, run RAG queries, search code examples, query a Neo4j knowledge graph and check scripts for AI hallucinations.
- A TypeScript MCP server skeleton for Cloudflare Workers with GitHub OAuth and Postgres tools (`src/index-es.ts`).
- About 40 Spanish guides in `PRPs/ai_docs/` plus PRP templates in `PRPs/templates/`.
- `ejemplos/`: example React components, hooks, SQL schemas and RLS policies, tests, taken from a restaurant booking app.
- Env template files; variable names only (`OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GITHUB_CLIENT_ID`, ...). Fill in your own values.

## Built with

Python 3.12 (crawl4ai, mcp, supabase, openai, neo4j), TypeScript (MCP SDK, Cloudflare Workers), Docker, Markdown.

## Run it locally

```bash
git clone https://github.com/lroy-stack/mcp-fullstack-esp.git
cd mcp-fullstack-esp
cp .env.mcp.template .env      # then fill in your own values
uv pip install -e . && crawl4ai-setup
python src/crawl4ai_mcp.py
```

Status: archived prototype, not maintained.

---

Experimento de julio 2025 con Claude Code, basado en el servidor MCP de Cole Medin (crawl4ai-rag). Intenta convertirlo en un "desarrollador full stack" con guías PRP y ejemplos en español; es sobre todo documentación y código de ejemplo, no un servidor terminado.
