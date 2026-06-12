export const slides = [

// ═══════════════════════════════════════════════════════
// SLIDE 0 — Title
// ═══════════════════════════════════════════════════════
`<div class="center">
  <div class="part-label">Workshop</div>
  <h1>867 Commits<br>in <span class="accent">92 Days</span><span class="cursor"></span></h1>
  <p class="subtitle">The development loop — how we build with AI</p>
  <div class="stat-grid mt-3" style="max-width: 700px; margin-left: auto; margin-right: auto;">
    <div class="stat">
      <div class="stat-value">4</div>
      <div class="stat-label">Phase Loop</div>
    </div>
    <div class="stat">
      <div class="stat-value">35+</div>
      <div class="stat-label">Projects</div>
    </div>
    <div class="stat">
      <div class="stat-value">1</div>
      <div class="stat-label">Patterns Library</div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 1 — The Loop
// ═══════════════════════════════════════════════════════
`<div class="center">
  <h2>The Development <span class="accent">Loop</span></h2>
  <p class="dim mb-2">Every feature follows this cycle — from spec to ship</p>
  <div style="display: flex; justify-content: center; margin: 1rem 0;">
    <svg width="460" height="460" viewBox="0 0 460 460">
      <defs>
        <marker id="arrow-doc" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#FFBE55"/>
        </marker>
        <marker id="arrow-impl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3FF583"/>
        </marker>
        <marker id="arrow-debug" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF7A6B"/>
        </marker>
        <marker id="arrow-test" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#A7F0C8"/>
        </marker>
      </defs>

      <!-- Connecting arcs -->
      <path d="M 300 80 A 140 140 0 0 1 380 160" fill="none" stroke="#FFBE55" stroke-width="2.5" marker-end="url(#arrow-impl)" opacity="0.5"/>
      <path d="M 380 300 A 140 140 0 0 1 300 380" fill="none" stroke="#3FF583" stroke-width="2.5" marker-end="url(#arrow-debug)" opacity="0.5"/>
      <path d="M 160 380 A 140 140 0 0 1 80 300" fill="none" stroke="#FF7A6B" stroke-width="2.5" marker-end="url(#arrow-test)" opacity="0.5"/>
      <path d="M 80 160 A 140 140 0 0 1 160 80" fill="none" stroke="#A7F0C8" stroke-width="2.5" marker-end="url(#arrow-doc)" opacity="0.5"/>

      <!-- Phase nodes -->
      <!-- Document (top) -->
      <rect x="155" y="30" width="150" height="70" rx="16" fill="#0A130D" stroke="#FFBE55" stroke-width="2"/>
      <text x="230" y="58" text-anchor="middle" fill="#FFBE55" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">DOCUMENT</text>
      <text x="230" y="78" text-anchor="middle" fill="#6E8A78" font-size="10" font-family="'IBM Plex Mono', monospace">PRDs, ADRs, specs</text>

      <!-- Implement (right) -->
      <rect x="320" y="195" width="135" height="70" rx="16" fill="#0A130D" stroke="#3FF583" stroke-width="2"/>
      <text x="387" y="223" text-anchor="middle" fill="#3FF583" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">IMPLEMENT</text>
      <text x="387" y="243" text-anchor="middle" fill="#6E8A78" font-size="10" font-family="'IBM Plex Mono', monospace">feat() commits</text>

      <!-- Debug (bottom) -->
      <rect x="155" y="360" width="150" height="70" rx="16" fill="#0A130D" stroke="#FF7A6B" stroke-width="2"/>
      <text x="230" y="388" text-anchor="middle" fill="#FF7A6B" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">DEBUG / VERIFY</text>
      <text x="230" y="408" text-anchor="middle" fill="#6E8A78" font-size="10" font-family="'IBM Plex Mono', monospace">fix() commits</text>

      <!-- Test (left) -->
      <rect x="5" y="195" width="135" height="70" rx="16" fill="#0A130D" stroke="#A7F0C8" stroke-width="2"/>
      <text x="72" y="223" text-anchor="middle" fill="#A7F0C8" font-size="13" font-weight="700" font-family="'IBM Plex Mono', monospace">TEST</text>
      <text x="72" y="243" text-anchor="middle" fill="#6E8A78" font-size="10" font-family="'IBM Plex Mono', monospace">test() commits</text>

      <!-- Center label -->
      <text x="230" y="225" text-anchor="middle" fill="#3FF583" font-size="16" font-weight="900" font-family="'IBM Plex Mono', monospace">REPEAT</text>
      <text x="230" y="245" text-anchor="middle" fill="#6E8A78" font-size="10" font-family="'IBM Plex Mono', monospace">every feature arc</text>
    </svg>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 2 — The Loop in Data (Stacked Chart)
// ═══════════════════════════════════════════════════════
`<div>
  <h2>The Loop in <span class="accent">Data</span></h2>
  <p class="dim mb-1">867 commits by type, by week — real data from <code>git log</code></p>
  <div style="display: flex; justify-content: center; margin: 1.5rem 0;">
    <svg width="760" height="300" viewBox="0 0 760 300">
      <style>
        .cl { fill: #6E8A78; font-family: 'IBM Plex Mono', monospace; font-size: 10px; }
        .gl { stroke: #12281B; stroke-width: 1; }
      </style>

      <!-- Y axis -->
      <text class="cl" x="42" y="44" text-anchor="end">130</text>
      <line class="gl" x1="48" y1="40" x2="730" y2="40"/>
      <text class="cl" x="42" y="84" text-anchor="end">100</text>
      <line class="gl" x1="48" y1="80" x2="730" y2="80" stroke-dasharray="3,4"/>
      <text class="cl" x="42" y="124" text-anchor="end">65</text>
      <line class="gl" x1="48" y1="120" x2="730" y2="120" stroke-dasharray="3,4"/>
      <text class="cl" x="42" y="164" text-anchor="end">30</text>
      <line class="gl" x1="48" y1="160" x2="730" y2="160" stroke-dasharray="3,4"/>
      <line x1="48" y1="200" x2="730" y2="200" stroke="#1F6B3E" stroke-width="1.5"/>

      <!-- Bars: stacking order bottom→top: docs, feat, fix, test
           origin=200, ceiling=40, range=160px, max~138 (Apr19)
           scale: 1 commit = 160/138 = 1.159px
           s=1.159, bar width=60, gap=8 -->

      <!-- Feb: d3 f17 x8 t5 = 33 -->
      <rect x="55" y="196.5" width="60" height="3.5" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="55" y="176.8" width="60" height="19.7" fill="#3FF583" opacity="0.9"/>
      <rect x="55" y="167.5" width="60" height="9.3" fill="#FF7A6B" opacity="0.9"/>
      <rect x="55" y="161.7" width="60" height="5.8" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="85" y="216" text-anchor="middle">Feb</text>

      <!-- Apr 12: x4 = 4 -->
      <rect x="123" y="195.4" width="60" height="4.6" rx="3" fill="#FF7A6B" opacity="0.9"/>
      <text class="cl" x="153" y="216" text-anchor="middle">Apr 12</text>

      <!-- Apr 19: d4 f59 x75 = 138 -->
      <rect x="191" y="195.4" width="60" height="4.6" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="191" y="127.0" width="60" height="68.4" fill="#3FF583" opacity="0.9"/>
      <rect x="191" y="40.1" width="60" height="86.9" rx="3" fill="#FF7A6B" opacity="0.9"/>
      <text class="cl" x="221" y="216" text-anchor="middle">Apr 19</text>

      <!-- Apr 26: d2 f22 x31 t5 = 60 -->
      <rect x="259" y="197.7" width="60" height="2.3" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="259" y="172.2" width="60" height="25.5" fill="#3FF583" opacity="0.9"/>
      <rect x="259" y="136.3" width="60" height="35.9" fill="#FF7A6B" opacity="0.9"/>
      <rect x="259" y="130.5" width="60" height="5.8" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="289" y="216" text-anchor="middle">Apr 26</text>

      <!-- May 3: d1 f11 x18 t2 = 32 -->
      <rect x="327" y="198.8" width="60" height="1.2" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="327" y="186.1" width="60" height="12.7" fill="#3FF583" opacity="0.9"/>
      <rect x="327" y="165.2" width="60" height="20.9" fill="#FF7A6B" opacity="0.9"/>
      <rect x="327" y="162.9" width="60" height="2.3" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="357" y="216" text-anchor="middle">May 3</text>

      <!-- May 10: d6 f36 x51 t2 = 95 -->
      <rect x="395" y="193.0" width="60" height="7.0" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="395" y="151.3" width="60" height="41.7" fill="#3FF583" opacity="0.9"/>
      <rect x="395" y="92.2" width="60" height="59.1" fill="#FF7A6B" opacity="0.9"/>
      <rect x="395" y="89.9" width="60" height="2.3" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="425" y="216" text-anchor="middle">May 10</text>

      <!-- May 17: d3 f31 x91 t1 = 126 -->
      <rect x="463" y="196.5" width="60" height="3.5" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="463" y="160.6" width="60" height="35.9" fill="#3FF583" opacity="0.9"/>
      <rect x="463" y="55.1" width="60" height="105.5" fill="#FF7A6B" opacity="0.9"/>
      <rect x="463" y="53.9" width="60" height="1.2" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="493" y="216" text-anchor="middle">May 17</text>

      <!-- May 24: d8 f28 x37 t4 = 77 -->
      <rect x="531" y="190.7" width="60" height="9.3" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="531" y="158.3" width="60" height="32.4" fill="#3FF583" opacity="0.9"/>
      <rect x="531" y="115.4" width="60" height="42.9" fill="#FF7A6B" opacity="0.9"/>
      <rect x="531" y="110.8" width="60" height="4.6" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="561" y="216" text-anchor="middle">May 24</text>

      <!-- May 31: d5 f23 x34 t1 = 63 -->
      <rect x="599" y="194.2" width="60" height="5.8" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="599" y="167.5" width="60" height="26.7" fill="#3FF583" opacity="0.9"/>
      <rect x="599" y="128.1" width="60" height="39.4" fill="#FF7A6B" opacity="0.9"/>
      <rect x="599" y="126.9" width="60" height="1.2" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="629" y="216" text-anchor="middle">May 31</text>

      <!-- Jun 7: d2 f7 x11 t6 = 26 -->
      <rect x="667" y="197.7" width="60" height="2.3" rx="3" fill="#FFBE55" opacity="0.85"/>
      <rect x="667" y="189.6" width="60" height="8.1" fill="#3FF583" opacity="0.9"/>
      <rect x="667" y="176.8" width="60" height="12.8" fill="#FF7A6B" opacity="0.9"/>
      <rect x="667" y="169.9" width="60" height="6.9" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text class="cl" x="697" y="216" text-anchor="middle">Jun 7</text>

      <!-- Legend (matches loop order: docs → feat → fix → test) -->
      <rect x="170" y="240" width="14" height="14" rx="3" fill="#FFBE55" opacity="0.85"/>
      <text x="190" y="252" fill="#C8E8D2" font-size="12" font-family="'IBM Plex Mono', monospace">docs</text>
      <rect x="250" y="240" width="14" height="14" rx="3" fill="#3FF583" opacity="0.9"/>
      <text x="270" y="252" fill="#C8E8D2" font-size="12" font-family="'IBM Plex Mono', monospace">feat</text>
      <rect x="325" y="240" width="14" height="14" rx="3" fill="#FF7A6B" opacity="0.9"/>
      <text x="345" y="252" fill="#C8E8D2" font-size="12" font-family="'IBM Plex Mono', monospace">fix</text>
      <rect x="395" y="240" width="14" height="14" rx="3" fill="#A7F0C8" opacity="0.9"/>
      <text x="415" y="252" fill="#C8E8D2" font-size="12" font-family="'IBM Plex Mono', monospace">test</text>

      <!-- Annotation -->
      <text x="460" y="278" text-anchor="middle" fill="#6E8A78" font-size="10" font-family="'IBM Plex Mono', monospace">docs → feat → fix → test — the loop repeats weekly</text>
    </svg>
  </div>
  <p class="dim center" style="font-size: 0.85rem;">Every peak tells a story — <span class="bold" style="color:#FF7A6B;">red waves</span> are the debug phase catching up to <span class="bold" style="color:#3FF583;">green builds</span>.</p>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 3 — Document Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #FFBE55;">Document</span> — Phase 1</h2>
  <p class="dim mb-2">Spec before you ship. Every feature starts with a PRD.</p>
  <div class="two-col">
    <div>
      <h3 style="color: #FFBE55;">/new-feature Workflow</h3>
      <ul class="insight-list">
        <li><span class="bold">PRD first</span> — product requirements, architecture, constraints documented before the first line of code</li>
        <li><span class="bold">ADRs</span> — architectural decision records for non-obvious choices (why CBOR? why 4 tiers?)</li>
        <li><span class="bold">Living notes</span> — human priorities and decisions logged where AI can read them at session start</li>
        <li><span class="bold">Task planning</span> — define scope and constraints before implementation begins</li>
      </ul>
    </div>
    <div>
      <h3>P2P Example</h3>
      <pre><code><span class="cm">// June 1, 2026 — 16:36:43</span>
<span class="fn">docs</span>(<span class="type">content</span>): <span class="str">PRD + architecture
  + TODO for P2P content exchange</span>

<span class="cm">// 1,598 lines added</span>
<span class="cm">// .claude/docs/prd/</span>
<span class="cm">// .claude/docs/architecture/</span>

<span class="cm">// 5 seconds later — 16:36:38</span>
<span class="fn">feat</span>(<span class="type">content</span>): <span class="str">Phase C.1 — types,
  errors, availability index</span>

<span class="cm">// The PRD and first implementation</span>
<span class="cm">// committed in the same session.</span>
<span class="cm">// Spec is fresh, code follows.</span></code></pre>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 4 — Implement Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #3FF583;">Implement</span> — Phase 2</h2>
  <p class="dim mb-2">Agent orchestra builds the feature in phased delivery</p>
  <div class="two-col">
    <div>
      <h3 style="color: #3FF583;">Phased Delivery</h3>
      <div class="tier-stack">
        <div class="tier" style="border-color: #3FF583;">
          <div class="tier-num" style="background: #3FF583;">C1</div>
          <div>
            <div class="tier-label">Types & Foundation</div>
            <div class="tier-desc">Types, errors, availability index</div>
          </div>
        </div>
        <div class="tier" style="border-color: #3FF583;">
          <div class="tier-num" style="background: #3FF583;">C2</div>
          <div>
            <div class="tier-label">Wire Protocol</div>
            <div class="tier-desc">Content server, request/response</div>
          </div>
        </div>
        <div class="tier" style="border-color: #3FF583;">
          <div class="tier-num" style="background: #3FF583;">D1</div>
          <div>
            <div class="tier-label">Small Strategy</div>
            <div class="tier-desc">Orchestrator, single-peer fetch</div>
          </div>
        </div>
        <div class="tier" style="border-color: #3FF583;">
          <div class="tier-num" style="background: #3FF583;">D2</div>
          <div>
            <div class="tier-label">Multi-Strategy</div>
            <div class="tier-desc">Medium/large strategies, tier router</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3>Micro-Atomic Commits</h3>
      <pre><code><span class="cm">// Each commit is self-contained</span>
<span class="cm">// with clear rationale — not megacommits</span>

<span class="fn">feat</span>(<span class="type">p2p</span>): <span class="str">batch 16 blocks per
  dc.send() to bypass SCTP
  52-message wall</span>

<span class="fn">feat</span>(<span class="type">content</span>): <span class="str">wire protocol for
  content server request/response</span>

<span class="cm">// Model selection matters:</span>
<span class="cm">// Claude Opus 4.6 — 466 commits</span>
<span class="cm">//   Complex systems, architecture</span>
<span class="cm">// Claude Sonnet — 58 commits</span>
<span class="cm">//   Quick fixes, lightweight tasks</span></code></pre>
      <p class="dim mt-1" style="font-size: 0.85rem;"><span class="bold green">25% of all commits</span> are feat — the build phase is focused but not the longest.</p>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 5 — Debug/Verify Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #FF7A6B;">Debug / Verify</span> — Phase 3</h2>
  <p class="dim mb-1">The longest phase. 40% of all commits are fixes.</p>
  <div class="two-col">
    <div>
      <h3 class="red">P2P Case Study: 12 Theories, 1 Bug</h3>
      <ul class="insight-list">
        <li><span class="red bold">Theory 1:</span> SCTP buffer overflow → batching</li>
        <li><span class="red bold">Theory 2:</span> Message pacing → 100ms, 50ms, yields</li>
        <li><span class="red bold">Theory 3:</span> Channel reliability → maxRetransmits</li>
        <li><span class="red bold">Theory 4:</span> Timeout too aggressive → 30s</li>
        <li><span class="red bold">5-12:</span> Buffer monitoring, ready state, counters...</li>
      </ul>
      <div class="card mt-1" style="border-color: var(--amber);">
        <h3 style="color: var(--amber);">/escalate</h3>
        <p>4 models in parallel: GPT-5.5, Gemini 3.1, DeepSeek V4, Claude Opus</p>
      </div>
    </div>
    <div>
      <h3 class="green">The One-Line Fix</h3>
      <pre><code><span class="cm">// buildBlockIds used hl.idx + i</span>
<span class="cm">// But idx is hash-list position,</span>
<span class="cm">// not cumulative block offset!</span>

<span class="cm">// Before (wrong):</span>
blockId = hl.idx + i;  <span class="cm">// ordinal</span>

<span class="cm">// After (correct):</span>
blockId = cursor++;    <span class="cm">// cumulative</span>

<span class="cm">// ONE LINE. 22 commits. 3 days.</span></code></pre>
      <div class="card mt-1" style="border-color: var(--green);">
        <h3 style="color: var(--green);">GPT-5.5 Found It</h3>
        <p>"The only model out of 4 to spot the root cause. All SCTP/buffer theories were wrong."</p>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 6 — Test Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #A7F0C8;">Test</span> — Phase 4</h2>
  <p class="dim mb-2">The gate before repeat. Verify first, then codify into tests.</p>
  <div class="two-col">
    <div>
      <h3 style="color: #A7F0C8;">Test-After-Verify Pattern</h3>
      <p>Not TDD — we verify the fix manually first (debug phase), then write regression tests to lock it in. This isn't ideology, it's practical: when you're chasing a bug through 12 wrong theories, writing tests for each theory wastes time.</p>
      <div class="tier-stack mt-2">
        <div class="tier" style="border-color: #A7F0C8;">
          <div class="tier-num" style="background: #A7F0C8;">1</div>
          <div>
            <div class="tier-label">Regression Tests</div>
            <div class="tier-desc">Lock in the fix — ensure the specific bug never recurs</div>
          </div>
        </div>
        <div class="tier" style="border-color: #A7F0C8;">
          <div class="tier-num" style="background: #A7F0C8;">2</div>
          <div>
            <div class="tier-label">Edge Case Coverage</div>
            <div class="tier-desc">Hash-mismatch rejection, boundary conditions</div>
          </div>
        </div>
        <div class="tier" style="border-color: #A7F0C8;">
          <div class="tier-num" style="background: #A7F0C8;">3</div>
          <div>
            <div class="tier-label">E2E Stubs</div>
            <div class="tier-desc">Playwright skeletons for the next round</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3>P2P Test Commits (June 7)</h3>
      <pre><code><span class="cm">// After the fix was verified:</span>

<span class="fn">test</span>(<span class="type">p2p</span>): <span class="str">regression tests for
  buildBlockIds + batch handling
  + all strategies</span>

<span class="fn">test</span>(<span class="type">p2p</span>): <span class="str">add hash-mismatch
  rejection tests + harden
  RPC path</span>

<span class="cm">// Then documentation:</span>
<span class="fn">docs</span>(<span class="type">p2p</span>): <span class="str">mark content exchange
  complete, update ADR-012 status</span>

<span class="cm">// Then refactor:</span>
<span class="fn">refactor</span>(<span class="type">reader</span>): <span class="str">extract StoryView
  helpers into focused module</span></code></pre>
      <p class="dim mt-1" style="font-size: 0.85rem;">Tests gate the loop — once they pass, the feature is <span class="bold cyan">locked</span> and the loop restarts for the next arc.</p>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 7 — Patterns Library
// ═══════════════════════════════════════════════════════
`<div>
  <h2>The <span class="accent">Patterns</span> Library</h2>
  <p class="dim mb-2">One repo feeds all 35+ projects — consistent stack, zero reinvention</p>
  <div class="two-col">
    <div>
      <h3>~/Development/patterns/</h3>
      <div class="tier-stack">
        <div class="tier">
          <div class="tier-num" style="background: var(--green);">→</div>
          <div>
            <div class="tier-label">auth/</div>
            <div class="tier-desc">Supabase Auth + OAuth — login, signup, protected routes</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--amber);">→</div>
          <div>
            <div class="tier-label">stripe/</div>
            <div class="tier-desc">Stripe Checkout + webhooks + credit system</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--cyan);">→</div>
          <div>
            <div class="tier-label">diagnostics/</div>
            <div class="tier-desc">Browser telemetry — console, errors, fetch, auth interception</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--accent);">→</div>
          <div>
            <div class="tier-label">claudehooks/</div>
            <div class="tier-desc">24 lifecycle hooks — cost tracking, git gates, notifications</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--pink);">→</div>
          <div>
            <div class="tier-label">claudeskills/</div>
            <div class="tier-desc">19 reusable skills — feature workflows, diagnostics, code review</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3>Why It Matters</h3>
      <ul class="insight-list">
        <li><span class="bold accent">Zero cold starts.</span> New project? Copy auth/, stripe/, diagnostics/. You're running in minutes, not days.</li>
        <li><span class="bold green">AI knows the stack.</span> Same patterns across 35 projects means Claude's context is always warm — it's seen this code before.</li>
        <li><span class="bold cyan">Bugs fixed everywhere.</span> Fix a Supabase auth edge case once, propagate to all projects via /install-hooks.</li>
        <li><span class="bold amber">Compound knowledge.</span> Each project's learnings flow back. Glyffiti's P2P debugging improved the /escalate skill for every project.</li>
      </ul>
      <div class="card mt-1" style="border-color: var(--accent);">
        <h3>The Stack</h3>
        <p class="mono" style="font-size: 0.85rem;">React + Vite + Supabase + Tailwind + TypeScript</p>
        <p class="dim" style="font-size: 0.8rem;">One stack, deeply known. Not the best stack — <span class="bright">the known stack.</span></p>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 9 — Key Insights
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Key <span class="accent">Insights</span></h2>
  <p class="dim mb-2">What we've learned about coding with AI after 867 commits</p>
  <div class="two-col">
    <ol class="insight-list">
      <li><span class="bold" style="color:#FFBE55;">Document first.</span> A PRD takes 10 minutes. A wrong implementation takes 3 days. Spec before you ship.</li>
      <li><span class="bold green">Micro-atomic commits.</span> 29 commits in one session — each self-contained with rationale. Git is a lab notebook.</li>
      <li><span class="bold red">Fix-first culture.</span> 40% of commits are fixes. Ship, then stabilize. Perfection is the enemy.</li>
      <li><span class="bold cyan">Test after verify.</span> Don't test hypotheses — verify first, then codify. Tests lock in victories.</li>
      <li><span class="bold amber">One stack, deeply known.</span> React+Vite+Supabase across 35 projects. AI compounds on familiarity.</li>
    </ol>
    <ol class="insight-list" start="6">
      <li><span class="bold" style="color:#FFBE55;">Multi-model debugging.</span> Consult multiple models in parallel. Different perspectives find different bugs.</li>
      <li><span class="bold green">Patterns compound.</span> Fix it once, propagate everywhere. Hooks and skills travel with you across projects.</li>
      <li><span class="bold red">Context persists.</span> Notes, specs, and decision logs carry forward across sessions — no cold starts.</li>
    </ol>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 10 — End
// ═══════════════════════════════════════════════════════
`<div class="section-divider">
  <h1>Questions?</h1>
  <p class="subtitle mt-2">The Loop: Document → Implement → Debug → Test → Repeat</p>
  <div class="stat-grid mt-3" style="max-width: 720px;">
    <div class="stat">
      <div class="stat-value" style="font-size: 1.05rem; white-space: nowrap;">glyffiti-mobile.vercel.app</div>
      <div class="stat-label">Try It</div>
    </div>
  </div>
</div>`,

]
