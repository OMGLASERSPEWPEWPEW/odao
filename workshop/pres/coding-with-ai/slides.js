export const slides = [

// ═══════════════════════════════════════════════════════
// SLIDE 0 — Title
// ═══════════════════════════════════════════════════════
`<div class="center">
  <div class="part-label">Workshop</div>
  <h1>AI Loops<span class="cursor"></span></h1>
  <p class="subtitle">An iterative approach to feature development</p>
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
// SLIDE 1 — The Prompt That Started It All
// ═══════════════════════════════════════════════════════
`<div class="section-divider">
  <div class="part-label">June 1, 2026</div>
  <div class="card" style="border-color: var(--amber); border-style: solid; max-width: 780px; text-align: left;">
    <p style="color: var(--ink); font-size: clamp(0.88rem, 1.3vw, 1.05rem); line-height: 1.85; font-style: italic;">
      "We use solana right now exclusively to pull and cache stories — now we want to create a system where online users can pass textblocks to other users of a story. How do we get there. What do we have in place, what do we need to build?"
    </p>
  </div>
  <p class="dim mt-2" style="font-size: 0.9rem;">PRD, architecture, and first implementation shipped <span class="bold" style="color: var(--ink);">same session</span>. Full feature by day 3.</p>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 2 — The Loop
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
// SLIDE 3 — The Loop in Data (Stacked Chart)
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
// SLIDE 4 — Document Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #FFBE55;">Document</span> — Phase 1</h2>
  <p class="subtitle mb-2" style="font-size: clamp(0.95rem, 1.4vw, 1.15rem);"><code>/new-feature</code> explores the codebase, web searches, and derives comprehensive documentation.</p>
  <div class="tier-stack" style="max-width: 680px;">
    <div class="tier" style="border-color: #FFBE55;">
      <div class="tier-num" style="background: #FFBE55;">PRD</div>
      <div>
        <div class="tier-label">Product Requirements Doc</div>
        <div class="tier-desc">Problem, user stories, acceptance criteria, rollout plan</div>
      </div>
    </div>
    <div class="tier" style="border-color: #FFBE55;">
      <div class="tier-num" style="background: #FFBE55;">ADR</div>
      <div>
        <div class="tier-label">Architecture Decision Record</div>
        <div class="tier-desc">Non-obvious choices with rationale — why CBOR, why 4 tiers, why not BitTorrent</div>
      </div>
    </div>
    <div class="tier" style="border-color: #FFBE55;">
      <div class="tier-num" style="background: #FFBE55;">QA</div>
      <div>
        <div class="tier-label">QA Checklist</div>
        <div class="tier-desc">Bot-verifiable acceptance criteria — written before implementation, tested by automation</div>
      </div>
    </div>
    <div class="tier" style="border-color: #FFBE55;">
      <div class="tier-num" style="background: #FFBE55;">TODO</div>
      <div>
        <div class="tier-label">Feature TODO</div>
        <div class="tier-desc">Phased roadmap with stage tracking — documentation → implementing → testing → complete</div>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 5 — Implement Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #3FF583;">Implement</span> — Phase 2</h2>
  <p class="dim mb-2">Every session is tracked. Every commit is structured.</p>
  <div class="tier-stack" style="max-width: 680px;">
    <div class="tier" style="border-color: #3FF583;">
      <div class="tier-num" style="background: #3FF583;">→</div>
      <div>
        <div class="tier-label">Conversation logger</div>
        <div class="tier-desc">Every user/model exchange + tool use → daily log + topic heaps</div>
      </div>
    </div>
    <div class="tier" style="border-color: #3FF583;">
      <div class="tier-num" style="background: #3FF583;">→</div>
      <div>
        <div class="tier-label">Session journal</div>
        <div class="tier-desc">Tool usage, state transitions, lifecycle events per session</div>
      </div>
    </div>
    <div class="tier" style="border-color: #3FF583;">
      <div class="tier-num" style="background: #3FF583;">→</div>
      <div>
        <div class="tier-label">Cost tracker</div>
        <div class="tier-desc">Token usage and spend logged per session</div>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 6 — Debug/Verify Phase
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
    </div>
    <div>
      <h3 style="color: var(--amber);">/escalate</h3>
      <div class="tier-stack">
        <div class="tier" style="border-color: var(--amber); padding: 0.6rem 1rem;">
          <div class="tier-num" style="background: var(--amber); width: 22px; height: 22px; font-size: 0.7rem;">1</div>
          <div>
            <div class="tier-label" style="font-size: 0.9rem;">Gather context</div>
            <div class="tier-desc">Reads relevant files, git history, error logs</div>
          </div>
        </div>
        <div class="tier" style="border-color: var(--amber); padding: 0.6rem 1rem;">
          <div class="tier-num" style="background: var(--amber); width: 22px; height: 22px; font-size: 0.7rem;">2</div>
          <div>
            <div class="tier-label" style="font-size: 0.9rem;">Fan out to 4 models</div>
            <div class="tier-desc">GPT-5.5, Gemini 3.1, DeepSeek V4, Claude Opus — in parallel</div>
          </div>
        </div>
        <div class="tier" style="border-color: var(--amber); padding: 0.6rem 1rem;">
          <div class="tier-num" style="background: var(--amber); width: 22px; height: 22px; font-size: 0.7rem;">3</div>
          <div>
            <div class="tier-label" style="font-size: 0.9rem;">Synthesize consensus</div>
            <div class="tier-desc">Agreements, divergences, and a recommended fix</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 7 — Test Phase
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent" style="color: #A7F0C8;">Test</span> — Phase 4</h2>
  <p class="dim mb-2">Verify first, then write tests to lock it in.</p>
  <div class="tier-stack" style="max-width: 680px;">
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
        <div class="tier-label">E2E</div>
        <div class="tier-desc">Playwright skeletons for the next round</div>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 8 — The Stack
// ═══════════════════════════════════════════════════════
`<div class="section-divider">
  <h2>The <span class="accent">Stack</span></h2>
  <p class="dim" style="font-size: clamp(0.95rem, 1.4vw, 1.15rem); margin-bottom: 1.5rem;">Land on a single stack that works for you. In my case:</p>
  <p class="mono" style="font-size: clamp(1.1rem, 1.8vw, 1.4rem); color: var(--ink); margin-bottom: 1.5rem;">React + Vite + Supabase + Tailwind + TypeScript</p>
  <p class="dim" style="font-size: clamp(0.95rem, 1.4vw, 1.15rem);">Not the best stack — <span class="bright">the known stack.</span></p>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 9 — Patterns Library
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Why?</h2>
  <p class="dim mb-2">One repo feeds all 35+ projects — consistent stack, zero reinvention</p>
  <div class="two-col">
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
          <div class="tier-label">ai-gateway/</div>
          <div class="tier-desc">Multi-model routing — Claude, GPT, Gemini, DeepSeek</div>
        </div>
      </div>
    </div>
    <div class="tier-stack">
      <div class="tier">
        <div class="tier-num" style="background: var(--pink);">→</div>
        <div>
          <div class="tier-label">tts/</div>
          <div class="tier-desc">Text-to-speech — Piper voices, audio generation</div>
        </div>
      </div>
      <div class="tier">
        <div class="tier-num" style="background: var(--green);">→</div>
        <div>
          <div class="tier-label">claudehooks/</div>
          <div class="tier-desc">24 lifecycle hooks — cost tracking, git gates, notifications</div>
        </div>
      </div>
      <div class="tier">
        <div class="tier-num" style="background: var(--amber);">→</div>
        <div>
          <div class="tier-label">claudeskills/</div>
          <div class="tier-desc">19 reusable skills — feature workflows, diagnostics, code review</div>
        </div>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 10 — Key Insights
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Key <span class="accent">Insights</span></h2>
  <p class="dim mb-2">What we've learned about coding with AI after 867 commits</p>
  <ol class="insight-list" style="max-width: 720px;">
    <li><span class="bold" style="color:#FFBE55;">Document first.</span> A PRD takes 10 minutes. A wrong implementation takes 3 days. Spec before you ship.
      <br><span style="font-size: 0.82rem; padding-left: 1.5rem;"><span class="bold" style="color: var(--amber);">Skill:</span> <code>/new-feature</code> — a waterfall of research into documentation</span>
    </li>
    <li><span class="bold green">Implement.</span> Phased delivery — each phase is independently deployable and testable.
      <br><span style="font-size: 0.82rem; padding-left: 1.5rem;"><span class="bold" style="color: var(--mint);">Hooks:</span> create start and stop hooks to log every response between you and model — tool calls, state transitions, cost</span>
    </li>
    <li><span class="bold cyan">Test after verify.</span> Don't test hypotheses — verify first, then codify. Tests lock in victories.
      <br><span style="font-size: 0.82rem; padding-left: 1.5rem;"><span class="bold" style="color: var(--amber);">Skill:</span> <code>/create-tests</code> — regression tests, edge cases, E2E</span>
    </li>
  </ol>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 11 — End
// ═══════════════════════════════════════════════════════
`<div class="section-divider">
  <h1>Questions?</h1>
  <p class="subtitle mt-2">The Loop: Document → Implement → Debug → Test → Repeat</p>
  <div style="display: flex; justify-content: center; align-items: center; margin-top: 2.5rem; gap: 5rem;">
    <div style="text-align: center;">
      <div style="background: white; padding: 10px; display: inline-block; margin-bottom: 0.5rem;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://glyffiti.com&bgcolor=ffffff&color=000000" width="200" height="200" alt="Glyffiti QR"/>
      </div>
      <div style="font-size: 1.3rem; font-weight: 700; color: var(--ink);">Glyffiti</div>
      <div style="font-size: 0.75rem; color: var(--dim);">Write on Solana</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
      <a href="https://instagram.com/helloimderic" style="color: #E1306C; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 0.6rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        helloimderic
      </a>
      <a href="https://tiktok.com/@omglaserspewpewpew" style="color: #69C9D0; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 0.6rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#69C9D0"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.7a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.13z"/></svg>
        omglaserspewpewpew
      </a>
      <a href="https://linkedin.com/in/dericortiz" style="color: #0A66C2; text-decoration: none; font-size: 0.95rem; display: flex; align-items: center; gap: 0.6rem;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        dericortiz
      </a>
    </div>
    <div style="text-align: center;">
      <div style="background: white; padding: 10px; display: inline-block; margin-bottom: 0.5rem;">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://familia-lake.vercel.app&bgcolor=ffffff&color=000000" width="200" height="200" alt="Familia QR"/>
      </div>
      <div style="font-size: 1.3rem; font-weight: 700; color: var(--ink);">Familia</div>
      <div style="font-size: 0.75rem; color: var(--dim);">Family memory keeper</div>
    </div>
  </div>
</div>`,

]
