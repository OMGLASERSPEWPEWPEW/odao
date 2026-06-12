---
name: html
description: >
  Generate rich, interactive HTML analysis pages and publish them as artifacts
  to Supabase. Use for specs, research, architecture analysis, design explorations,
  or any complex information that benefits from visual richness over markdown.
user_invocable: true
---

# /html — Rich HTML Artifact Generator

Generate a self-contained HTML document from research and analysis, then publish it to Supabase so it's viewable at your project's `/ai-chat/<slug>` route.

Inspired by "The Unreasonable Effectiveness of HTML" — HTML beats markdown for information density, visual clarity, interactivity, and shareability. Use this when terminal output isn't enough.

## Prerequisites

This skill requires:
- A Supabase `ai_artifacts` table (see migration below)
- A `/ai-chat/:slug?` route in your app that renders artifacts via iframe
- The Supabase MCP with write access enabled

**Migration:**
```sql
create table public.ai_artifacts (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  description text,
  html        text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.ai_artifacts enable row level security;
create policy ai_artifacts_read on public.ai_artifacts for select using (true);
create policy ai_artifacts_insert on public.ai_artifacts for insert with check (auth.uid() is not null);
create policy ai_artifacts_update on public.ai_artifacts for update using (auth.uid() is not null);
create index ai_artifacts_slug_idx on public.ai_artifacts (slug);
create index ai_artifacts_created_at_idx on public.ai_artifacts (created_at desc);
```

**CSP note:** If your app has a Content-Security-Policy, add `https://cdn.tailwindcss.com` to `script-src`. The `srcdoc` iframe inherits the parent page's CSP.

## When to use

- Architecture analysis and design exploration
- Research synthesis (competitive analysis, technical options)
- Specs and implementation plans with diagrams
- Code review explainers with annotated diffs
- Interactive prototypes with sliders, toggles, decision cards
- Reports with tables, charts, and visual data
- Any complex information that benefits from being read in a browser

## Execution

### 1. Determine topic, title, and slug

**If the user provides a topic** (`/html how should tipping work`), use it directly.

**If the user just types `/html`** with no arguments, analyze the current conversation to auto-derive:
- **What was the main subject?** Look at the questions asked, code explored, decisions discussed.
- **What would make a useful document?** Synthesize the conversation into a coherent artifact.
- **Title:** A clear, descriptive name (e.g., "Auth Flow Explainer", "Database Migration Strategy").
- **Slug:** Lowercase, hyphenated, max 60 chars, derived from the title.

The goal is zero-friction: the user just types `/html` and gets a polished artifact from whatever they've been discussing.

### 2. Research

Do the actual analysis work:
- Read relevant code files
- Search the web if needed (WebSearch/WebFetch)
- Check git history for context
- Read existing docs, ADRs, specs
- Gather data from any available source

This is the substance. The HTML is just the container — the research is the value. If the conversation already covered the research, synthesize it rather than re-doing it.

### 3. Generate the HTML document

Write a complete, self-contained HTML5 document. **Do not use a rigid template** — shape the HTML to fit the content. But follow these design guidelines:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><!-- artifact title --></title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Critical CSS to prevent FOUC while Tailwind CDN loads */
    body { background: #000; color: #d4d4d8; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="bg-black text-zinc-300 min-h-screen">
  <!-- content -->
</body>
</html>
```

**Default design language** (customize per project):
- Dark theme: `bg-black` or `bg-zinc-950` body
- Primary text: `text-zinc-300` (body), `text-white` (headings)
- Accent: `text-amber-400`, `bg-amber-500/10`, `border-amber-500`
- Muted: `text-zinc-500`, `text-zinc-600`
- Borders: `border-zinc-800`
- Cards/panels: `bg-zinc-900`, `border border-zinc-800 rounded-xl`
- Section labels: `font-mono text-sm uppercase tracking-wider text-amber-500`
- Container: `max-w-3xl mx-auto px-4 py-12`
- Responsive: works on mobile without horizontal scrolling

**Rich elements to use freely:**
- **Tables** for comparisons and data
- **SVG diagrams** for architecture, flows, relationships (inline, not external)
- **Interactive elements** via vanilla JS: tabs, toggles, decision cards, sliders, accordions
- **Code blocks** with syntax highlighting (`bg-zinc-900 rounded-lg p-4 font-mono text-sm`)
- **Status badges**: colored pills for ready/partial/missing states
- **Progress bars** and visual indicators
- **Proportional bar charts** (colored divs with percentage widths)
- **"Copy as prompt" buttons** where the user might feed choices back to Claude

**What NOT to do:**
- Don't use React, Vue, or any framework — vanilla JS only
- Don't load external JS besides Tailwind CDN
- Don't use external images (use SVG or emoji for icons)
- Don't make it too long — optimize for reading, not completeness
- Don't use a rigid template — let the content shape the structure

### 4. Upload to Supabase

Use `mcp__supabase__execute_sql` to upsert the artifact. Replace `<project-ref>` with your Supabase project ID:

```sql
INSERT INTO public.ai_artifacts (slug, title, description, html, metadata)
VALUES (
  '<slug>',
  '<title>',
  '<one-line description>',
  '<html-content-with-single-quotes-doubled>',
  '{"author": "<agent-name>", "generated": "<YYYY-MM-DD>", "tags": ["tag1", "tag2"]}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  html = EXCLUDED.html,
  metadata = EXCLUDED.metadata;
```

**CRITICAL: SQL escaping.** The HTML content will contain single quotes. Every `'` in the HTML must become `''` (doubled) for the SQL string literal. This is the #1 source of errors. Double-check before executing.

### 5. Report the URL

Tell the user the artifact is published and where to find it. Include both the production URL and the local dev URL.

## Tips for great artifacts

- **Lead with the most important thing.** Don't bury the recommendation under background.
- **Use interactive elements** when the user needs to make decisions. Decision cards with click-to-select are better than bullet lists of options.
- **SVG diagrams** are worth the tokens. A flow diagram communicates architecture faster than prose.
- **Tables beat prose** for comparisons. If you're writing "X does this, but Y does that", make it a table.
- **Include a "copy as prompt" button** when the artifact has choices the user will want to feed back into Claude Code.
- **Keep it scannable.** Short sections, clear headings, visual hierarchy. Someone should get the gist in 30 seconds.

## Example invocations

- `/html` → (after discussing auth) auto-generates "Auth Flow Explainer" artifact
- `/html how should we handle caching` → explicit topic
- `/html weekly status report` → explicit topic with specific format
- `/html` → (after a debugging session) auto-generates a postmortem
