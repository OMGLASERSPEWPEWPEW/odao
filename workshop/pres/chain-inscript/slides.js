export const slides = [

// ═══════════════════════════════════════════════════════
// SLIDE 0 — Title
// ═══════════════════════════════════════════════════════
`<div class="center">
  <div class="part-label">Workshop</div>
  <h1>From Thought<br>to <span class="accent">Chain</span><span class="cursor"></span></h1>
  <p class="subtitle">How Glyffiti inscribes content on Solana</p>
  <div class="stat-grid mt-3" style="max-width: 600px; margin-left: auto; margin-right: auto;">
    <div class="stat">
      <div class="stat-value">4</div>
      <div class="stat-label">Tier Architecture</div>
    </div>
    <div class="stat">
      <div class="stat-value">414</div>
      <div class="stat-label">Usable Bytes per Tx</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="font-size: clamp(1.4rem, 3.5vw, 2.2rem);">~$0.001</div>
      <div class="stat-label">Per Block</div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 1 — The Problem
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Why Put Content <span class="accent">On-Chain?</span></h2>
  <div class="three-col mt-2">
    <div class="card">
      <h3>Permanence</h3>
      <p>Content lives as long as Solana lives. No server to shut down, no company to go bankrupt, no ToS to violate.</p>
    </div>
    <div class="card">
      <h3>Ownership</h3>
      <p>Cryptographic proof of authorship. The signer's public key is baked into every transaction — unforgeable attribution.</p>
    </div>
    <div class="card">
      <h3>Censorship Resistance</h3>
      <p>No platform can remove your work. Once inscribed, only network consensus can alter state — and nobody's reaching 67%.</p>
    </div>
  </div>
  <div class="mt-2">
    <p class="bright">The challenge: Solana transactions have a <code>566-byte</code> memo limit. How do you fit a document?</p>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 2 — Architecture Overview
// ═══════════════════════════════════════════════════════
`<div>
  <h2>The 4-Tier <span class="accent">Envelope</span></h2>
  <p class="dim mb-2">A hierarchical on-chain storage model — each tier is one or more Solana transactions</p>
  <div class="two-col">
    <div class="tier-stack">
      <div class="tier" style="background: linear-gradient(90deg, #3FF58315, transparent);">
        <div class="tier-num">1</div>
        <div>
          <div class="tier-label">DocScroll <span class="dim" style="font-size:0.8rem">— 1 tx</span></div>
          <div class="tier-desc">Top-level manifest: title, author, merkle root, format ID, block count</div>
        </div>
      </div>
      <div class="tier" style="background: linear-gradient(90deg, #A7F0C810, transparent);">
        <div class="tier-num" style="background: var(--cyan);">2</div>
        <div>
          <div class="tier-label">BlockHashList <span class="dim" style="font-size:0.8rem">— 1 per 5 blocks</span></div>
          <div class="tier-desc">Groups of up to 5 block hashes — for incremental verification</div>
        </div>
      </div>
      <div class="tier" style="background: linear-gradient(90deg, #3FF58310, transparent);">
        <div class="tier-num" style="background: var(--green);">3</div>
        <div>
          <div class="tier-label">BlockMemo <span class="dim" style="font-size:0.8rem">— 1 per block</span></div>
          <div class="tier-desc">Block content: inline if it fits, or a spill header pointing to chunks</div>
        </div>
      </div>
      <div class="tier" style="background: linear-gradient(90deg, #FFBE5510, transparent);">
        <div class="tier-num" style="background: var(--amber);">4</div>
        <div>
          <div class="tier-label">BlockChunk <span class="dim" style="font-size:0.8rem">— N per spilled block</span></div>
          <div class="tier-desc">Spillover content fragments when a block exceeds the 414-byte limit</div>
        </div>
      </div>
    </div>
    <div>
      <h3>Why 414 bytes?</h3>
      <pre><code><span class="cm">// Solana memo limit after encoding</span>
<span class="kw">const</span> MAX_MEMO_SIZE = <span class="num">566</span>;  <span class="cm">// bytes (UTF-8)</span>
<span class="kw">const</span> BS58_EXPANSION = <span class="num">1.365</span>; <span class="cm">// base58 overhead</span>

<span class="cm">// Usable payload space</span>
<span class="kw">const</span> MAX_RAW = <span class="num">566</span> / <span class="num">1.365</span>;
<span class="cm">// ≈ 414 bytes of actual data</span></code></pre>
      <p class="dim mt-1" style="font-size: 0.85rem;">Every byte matters. The serialization pipeline is designed to squeeze maximum content into minimum transactions.</p>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 3 — Document Preparation
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Step 1: <span class="accent">Document Preparation</span></h2>
  <p class="dim mb-2">Break document into blocks, hash each one for stable on-chain identity</p>
  <div class="two-col">
    <div>
      <h3>Block Extraction</h3>
      <p>A document is an array of blocks — each block has a type, index, optional attributes, and content. The format is opaque to the envelope system.</p>
      <pre><code><span class="cm">// packages/doc-schema/src/hash.ts</span>
<span class="kw">export async function</span> <span class="fn">hashBlock</span>(
  block: <span class="type">PublishableBlock</span>
): <span class="type">Promise</span>&lt;<span class="type">string</span>&gt; {
  <span class="kw">const</span> canonical = <span class="fn">canonicalize</span>({
    bi: block.bi,      <span class="cm">// block index</span>
    bt: block.bt,      <span class="cm">// block type (opaque)</span>
    attrs: block.attrs ?? <span class="kw">null</span>,
    content: block.content,
  });
  <span class="kw">return</span> <span class="fn">sha256Hex</span>(
    JSON.<span class="fn">stringify</span>(canonical)
  );
}</code></pre>
    </div>
    <div>
      <h3>Why Canonical JSON?</h3>
      <ul class="insight-list">
        <li><span class="bold">Deterministic</span> — key-sorted JSON ensures the same content always produces the same hash</li>
        <li><span class="bold">Stable identity</span> — block hash becomes its permanent on-chain address for reactions and citations</li>
        <li><span class="bold">Format-agnostic</span> — doc-schema doesn't know what <code>bt</code> or <code>content</code> mean — the format renderer decides</li>
      </ul>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 4 — Serialization Pipeline
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Step 2: <span class="accent">Serialization Pipeline</span></h2>
  <p class="dim mb-1">Three-stage transformation: structure → binary → compressed → encoded</p>
  <div class="pipeline mt-2 mb-2">
    <div class="pipeline-step">
      <div class="step-icon">{ }</div>
      <div class="step-label">JSON</div>
      <div class="step-detail">Source data</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step">
      <div class="step-icon">↕</div>
      <div class="step-label">Canonicalize</div>
      <div class="step-detail">Sort keys</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--accent);">
      <div class="step-icon">◆</div>
      <div class="step-label">CBOR</div>
      <div class="step-detail">Binary encode</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--green);">
      <div class="step-icon">⊘</div>
      <div class="step-label">Gzip</div>
      <div class="step-detail">Level 6</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--cyan);">
      <div class="step-icon">B₅₈</div>
      <div class="step-label">Base58</div>
      <div class="step-detail">Memo-safe</div>
    </div>
  </div>
  <div class="two-col">
    <div>
      <pre><code><span class="cm">// packages/doc-schema/src/serialize.ts</span>
<span class="kw">export function</span> <span class="fn">serialize</span>(
  value: <span class="type">unknown</span>
): <span class="type">Uint8Array</span> {
  <span class="kw">const</span> cborBytes = encoder.<span class="fn">encode</span>(
    <span class="fn">canonicalize</span>(value)
  );
  <span class="cm">// Prepend version byte (0x01)</span>
  <span class="kw">const</span> versioned = <span class="kw">new</span> <span class="type">Uint8Array</span>(
    <span class="num">1</span> + cborBytes.length
  );
  versioned[<span class="num">0</span>] = <span class="num">0x01</span>;
  versioned.<span class="fn">set</span>(cborBytes, <span class="num">1</span>);
  <span class="kw">return</span> pako.<span class="fn">gzip</span>(versioned, {
    level: <span class="num">6</span>
  });
}</code></pre>
    </div>
    <div>
      <h3>Why CBOR?</h3>
      <ul class="insight-list">
        <li><span class="bold">Compact</span> — ~10% smaller than JSON for structured data</li>
        <li><span class="bold">Binary-native</span> — no string escaping needed for raw bytes</li>
        <li><span class="bold">Schema-flexible</span> — handles mixed types without schema negotiation</li>
      </ul>
      <h3 class="mt-2">Why Gzip Level 6?</h3>
      <p>Sweet spot: 50-70% compression with fast encode. Level 9 gains <2% more but takes 3x longer — on a mobile device with 4G, encode time matters more than bytes saved.</p>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 5 — Chunking Strategy
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Step 3: <span class="accent">Chunking Strategy</span></h2>
  <p class="dim mb-2">Binary search fittability — does the serialized block fit in one memo?</p>
  <div class="two-col">
    <div>
      <h3>The Decision</h3>
      <pre><code><span class="cm">// packages/doc-schema/src/envelope.ts</span>

<span class="cm">// If serialized block ≤ 414 bytes →</span>
<span class="cm">//   Inline: one BlockMemo (Tier 3)</span>

<span class="cm">// If serialized block > 414 bytes →</span>
<span class="cm">//   Spill: BlockMemo header (Tier 3)</span>
<span class="cm">//        + N BlockChunks (Tier 4)</span>

<span class="cm">// UTF-16 surrogate pair safety:</span>
<span class="kw">if</span> (code >= <span class="num">0xD800</span> && code <= <span class="num">0xDBFF</span>)
  sliceLen++;  <span class="cm">// don't split a pair</span></code></pre>
      <h3 class="mt-2">Post-Processing</h3>
      <ol class="insight-list" style="counter-reset: none">
        <li>Binary search for max chars that fit 414 bytes</li>
        <li>Shrink oversized chunks by 1 char iteratively</li>
        <li>Rebalance content between adjacent chunks</li>
        <li>Update <code>idx</code> and <code>tc</code> for all chunks</li>
      </ol>
    </div>
    <div>
      <h3>Chunk Schema</h3>
      <pre><code><span class="cm">// BlockChunkMemo (Tier 4)</span>
{
  <span class="prop">p</span>: <span class="str">'g-doc-v1-chunk'</span>,
  <span class="prop">bh</span>: parentBlockHash,
  <span class="prop">idx</span>: <span class="num">0</span>,  <span class="cm">// chunk position</span>
  <span class="prop">tc</span>: <span class="num">3</span>,   <span class="cm">// total chunks</span>
  <span class="prop">c</span>: <span class="str">"JSON fragment..."</span>
}</code></pre>
      <div class="card mt-2" style="border-color: var(--amber);">
        <h3 style="color: var(--amber);">Why Not Just Compress More?</h3>
        <p>Compression is already applied before chunking. The 414-byte limit is after CBOR+gzip+bs58. Large blocks (code samples, long paragraphs) simply don't fit — chunking is the escape valve.</p>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 6 — Merkle Tree
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Step 4: <span class="accent">Merkle Tree</span></h2>
  <p class="dim mb-2">Sort-pair SHA-256 tree — one root hash to verify the entire document</p>
  <div class="two-col">
    <div>
      <div class="merkle-tree">
        <svg width="420" height="250" viewBox="0 0 420 250">
          <style>
            .node { fill: var(--surface); stroke: var(--border); stroke-width: 1.5; rx: 8; }
            .root { fill: var(--surface); stroke: var(--accent); stroke-width: 2; rx: 8; }
            .edge { stroke: var(--text-dim); stroke-width: 1.5; stroke-dasharray: 4 4; }
            .hash { fill: var(--text-dim); font-family: 'IBM Plex Mono', monospace; font-size: 10px; }
            .label { fill: var(--text); font-family: 'IBM Plex Mono', monospace; font-size: 11px; font-weight: 600; }
          </style>
          <line class="edge" x1="210" y1="50" x2="110" y2="100"/>
          <line class="edge" x1="210" y1="50" x2="310" y2="100"/>
          <line class="edge" x1="110" y1="130" x2="55" y2="180"/>
          <line class="edge" x1="110" y1="130" x2="165" y2="180"/>
          <line class="edge" x1="310" y1="130" x2="260" y2="180"/>
          <line class="edge" x1="310" y1="130" x2="365" y2="180"/>
          <rect class="root" x="155" y="15" width="110" height="40"/>
          <text class="label" x="210" y="38" text-anchor="middle" fill="#3FF583">Merkle Root</text>
          <rect class="node" x="55" y="95" width="110" height="40"/>
          <text class="hash" x="110" y="118" text-anchor="middle">H(B0+B1)</text>
          <rect class="node" x="255" y="95" width="110" height="40"/>
          <text class="hash" x="310" y="118" text-anchor="middle">H(B2+B3)</text>
          <rect class="node" x="5" y="175" width="100" height="40"/>
          <text class="hash" x="55" y="198" text-anchor="middle">Block 0</text>
          <rect class="node" x="115" y="175" width="100" height="40"/>
          <text class="hash" x="165" y="198" text-anchor="middle">Block 1</text>
          <rect class="node" x="210" y="175" width="100" height="40"/>
          <text class="hash" x="260" y="198" text-anchor="middle">Block 2</text>
          <rect class="node" x="315" y="175" width="100" height="40"/>
          <text class="hash" x="365" y="198" text-anchor="middle">Block 3</text>
          <text class="hash" x="210" y="240" text-anchor="middle" fill="#4E6B58">Pairs sorted lexicographically before hashing</text>
        </svg>
      </div>
    </div>
    <div>
      <pre><code><span class="cm">// packages/doc-schema/src/merkle.ts</span>
<span class="kw">async function</span> <span class="fn">hashPair</span>(
  a: <span class="type">string</span>, b: <span class="type">string</span>
): <span class="type">Promise</span>&lt;<span class="type">string</span>&gt; {
  <span class="kw">const</span> [lo, hi] = [a, b].<span class="fn">sort</span>(
    (x, y) => x.<span class="fn">localeCompare</span>(y)
  );
  <span class="kw">return</span> <span class="fn">sha256Hex</span>(lo + hi);
}

<span class="kw">export async function</span> <span class="fn">blockMerkleRoot</span>(
  hashes: <span class="type">readonly string</span>[]
): <span class="type">Promise</span>&lt;<span class="type">string</span>&gt; {
  <span class="kw">let</span> level = [...hashes];
  <span class="kw">while</span> (level.length > <span class="num">1</span>) {
    <span class="kw">const</span> next = [];
    <span class="kw">for</span> (<span class="kw">let</span> i = <span class="num">0</span>; i < level.length; i += <span class="num">2</span>) {
      <span class="kw">const</span> right = level[i+<span class="num">1</span>] ?? level[i];
      next.<span class="fn">push</span>(<span class="kw">await</span> <span class="fn">hashPair</span>(level[i], right));
    }
    level = next;
  }
  <span class="kw">return</span> level[<span class="num">0</span>];
}</code></pre>
      <p class="dim mt-1" style="font-size: 0.85rem;"><span class="bold bright">Key property:</span> Sort-pair means the same two hashes always produce the same parent, regardless of child order.</p>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 7 — Transaction Construction
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Step 5: <span class="accent">Transaction Construction</span></h2>
  <p class="dim mb-2">Three instructions per Solana transaction — compute budget + priority + memo</p>
  <div class="two-col">
    <div>
      <h3>Anatomy of One Tx</h3>
      <div class="tier-stack">
        <div class="tier" style="background: linear-gradient(90deg, #FFBE5510, transparent);">
          <div class="tier-num" style="background: var(--amber);">1</div>
          <div>
            <div class="tier-label" style="font-size: 0.95rem;">ComputeBudget.setLimit</div>
            <div class="tier-desc">300k compute units — Memo v2 signer verification needs headroom</div>
          </div>
        </div>
        <div class="tier" style="background: linear-gradient(90deg, #f4726610, transparent);">
          <div class="tier-num" style="background: var(--red);">2</div>
          <div>
            <div class="tier-label" style="font-size: 0.95rem;">ComputeBudget.setPrice</div>
            <div class="tier-desc">50k microLamports priority fee — enough to avoid being dropped</div>
          </div>
        </div>
        <div class="tier" style="background: linear-gradient(90deg, #3FF58315, transparent);">
          <div class="tier-num">3</div>
          <div>
            <div class="tier-label" style="font-size: 0.95rem;">Memo Program</div>
            <div class="tier-desc">BS58-encoded CBOR+gzipped content — signer in instruction keys</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <pre><code><span class="cm">// src/lib/blockchain/memoBuilder.ts</span>
<span class="kw">export function</span> <span class="fn">buildMemoInstruction</span>(
  data: <span class="type">Uint8Array</span>,
  signer: <span class="type">PublicKey</span>
): <span class="type">TransactionInstruction</span> {
  <span class="kw">return new</span> <span class="type">TransactionInstruction</span>({
    keys: [{
      pubkey: signer,
      isSigner: <span class="kw">true</span>,
      isWritable: <span class="kw">false</span>
    }],
    programId: MEMO_PROGRAM_ID,
    data: data <span class="kw">as</span> <span class="type">Buffer</span>,
  });
}

<span class="cm">// Memo Program ID</span>
<span class="str">"MemoSq4gqABAXKb96qnH8T..."</span></code></pre>
      <div class="card mt-1" style="border-color: var(--cyan);">
        <h3 style="color: var(--cyan);">Blockhash Caching</h3>
        <p>20-second TTL cache on <code>getLatestBlockhash</code> — avoids rate-limited RPC calls when publishing multiple transactions in sequence.</p>
      </div>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 8 — Publishing Loop
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Step 6: <span class="accent">Publishing Loop</span></h2>
  <p class="dim mb-2">Sequential broadcast with progress tracking, retry logic, and rate-limit awareness</p>
  <div class="pipeline mb-2">
    <div class="pipeline-step" style="border-color: var(--green);">
      <div class="step-icon">◼</div>
      <div class="step-label">Blocks</div>
      <div class="step-detail">Tier 3</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--amber);">
      <div class="step-icon">◻</div>
      <div class="step-label">Chunks</div>
      <div class="step-detail">Tier 4</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--cyan);">
      <div class="step-icon">#</div>
      <div class="step-label">Hash Lists</div>
      <div class="step-detail">Tier 2</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--accent);">
      <div class="step-icon">▤</div>
      <div class="step-label">Scroll</div>
      <div class="step-detail">Tier 1</div>
    </div>
  </div>
  <div class="two-col">
    <div>
      <h3>Why Bottom-Up?</h3>
      <ul class="insight-list">
        <li>Blocks and chunks are <span class="bold">content</span> — publish first so readers can start fetching early</li>
        <li>Hash lists need <span class="bold">block signatures</span> — published after blocks are confirmed</li>
        <li>Scroll needs <span class="bold">everything</span> — merkle root, total counts, all signatures — published last</li>
      </ul>
    </div>
    <div>
      <h3>Resilience</h3>
      <pre><code><span class="cm">// src/lib/publishing/publishDocument.ts</span>

<span class="cm">// 2-second delay between transactions</span>
<span class="kw">const</span> TX_DELAY = <span class="num">2000</span>;

<span class="cm">// 3 retries with 3s backoff</span>
<span class="kw">const</span> MAX_RETRIES = <span class="num">3</span>;
<span class="kw">const</span> RETRY_BACKOFF = <span class="num">3000</span>;

<span class="cm">// Resume from any stage after failure</span>
<span class="cm">// Checkpoint: { stage, index, sigs[] }</span></code></pre>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 9 — The Read Flow
// ═══════════════════════════════════════════════════════
`<div>
  <h2>The <span class="accent">Read Flow</span></h2>
  <p class="dim mb-1">Reverse the pipeline — progressive fetch with cryptographic verification</p>
  <div class="pipeline mt-2 mb-2">
    <div class="pipeline-step" style="border-color: var(--accent);">
      <div class="step-icon">▤</div>
      <div class="step-label">Fetch Scroll</div>
      <div class="step-detail">Tier 1</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step">
      <div class="step-icon">B₅₈</div>
      <div class="step-label">BS58 Decode</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--green);">
      <div class="step-icon">⊘</div>
      <div class="step-label">Gunzip</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--accent);">
      <div class="step-icon">◆</div>
      <div class="step-label">CBOR Decode</div>
    </div>
    <div class="pipeline-arrow">→</div>
    <div class="pipeline-step" style="border-color: var(--cyan);">
      <div class="step-icon">✓</div>
      <div class="step-label">Verify</div>
      <div class="step-detail">Merkle root</div>
    </div>
  </div>
  <div class="two-col">
    <div>
      <h3>Memo Extraction</h3>
      <pre><code><span class="cm">// From Solana transaction logs:</span>
<span class="str">"Program log: Memo (len 482): \\"3vQ...\\""</span>

<span class="cm">// Regex extraction:</span>
<span class="kw">const</span> match = log.<span class="fn">match</span>(
  <span class="str">/Memo \\(len \\d+\\): "(.+)"$/</span>
);
<span class="kw">const</span> bytes = bs58.<span class="fn">decode</span>(match[<span class="num">1</span>]);</code></pre>
    </div>
    <div>
      <h3>Deserialization</h3>
      <pre><code><span class="cm">// packages/doc-schema/src/serialize.ts</span>
<span class="kw">export function</span> <span class="fn">deserialize</span>&lt;T&gt;(
  bytes: <span class="type">Uint8Array</span>
): T {
  <span class="kw">const</span> decompressed = pako.<span class="fn">ungzip</span>(bytes);
  <span class="cm">// Skip version byte [0]</span>
  <span class="kw">return</span> <span class="fn">decode</span>(
    decompressed.<span class="fn">slice</span>(<span class="num">1</span>)
  ) <span class="kw">as</span> T;
}</code></pre>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 10 — Progressive Reading
// ═══════════════════════════════════════════════════════
`<div>
  <h2><span class="accent">Progressive</span> Reading</h2>
  <p class="dim mb-2">P2P-first strategy with RPC fallback — read a document without hammering the chain</p>
  <div class="two-col">
    <div>
      <h3>Four-Stage Read</h3>
      <div class="tier-stack">
        <div class="tier">
          <div class="tier-num">1</div>
          <div>
            <div class="tier-label">Fetch Scroll</div>
            <div class="tier-desc">One RPC call → get manifest with merkle root + counts</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--cyan);">2</div>
          <div>
            <div class="tier-label">Fetch Hash Lists</div>
            <div class="tier-desc">Sequential by signature — now we know all block hashes</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--green);">3</div>
          <div>
            <div class="tier-label">Fetch Blocks</div>
            <div class="tier-desc"><span class="bold green">P2P first</span> → RPC fallback with burst+pace strategy</div>
          </div>
        </div>
        <div class="tier">
          <div class="tier-num" style="background: var(--amber);">4</div>
          <div>
            <div class="tier-label">Fetch Chunks</div>
            <div class="tier-desc">Only for spilled blocks (c === null) — reassemble fragments</div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <h3>RPC Pacing</h3>
      <pre><code><span class="cm">// src/lib/reader/readBlocks.ts</span>

<span class="cm">// First 3 blocks: burst (no delay)</span>
<span class="cm">// Blocks 4+: 2.5s spacing</span>
<span class="cm">// On 429: 3 retries with backoff</span>

<span class="cm">// Hash validation on every block:</span>
<span class="kw">if</span> (block.bh !== expectedHash) {
  <span class="kw">return</span> <span class="fn">Err</span>(<span class="str">'SCHEMA_VALIDATION_FAILED'</span>);
}</code></pre>
      <h3 class="mt-2">Chunk Reassembly</h3>
      <pre><code><span class="cm">// packages/doc-schema/src/envelope.ts</span>
<span class="kw">export function</span> <span class="fn">reassembleBlockContent</span>(
  chunks: <span class="type">BlockChunkMemo</span>[]
): <span class="type">unknown</span> {
  <span class="kw">const</span> ordered = [...chunks]
    .<span class="fn">sort</span>((a, b) => a.idx - b.idx);
  <span class="kw">const</span> joined = ordered
    .<span class="fn">map</span>(c => c.c).<span class="fn">join</span>(<span class="str">''</span>);
  <span class="kw">return</span> JSON.<span class="fn">parse</span>(joined);
}</code></pre>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 11 — Compression Math
// ═══════════════════════════════════════════════════════
`<div>
  <h2>Cost & <span class="accent">Compression</span> Math</h2>
  <p class="dim mb-2">Every byte = SOL. The pipeline optimizes for minimum transactions.</p>
  <div class="math-flow mt-3 mb-3">
    <div class="math-box"><span class="bright">1000 bytes</span><br><span class="dim" style="font-size:0.7rem">Original JSON</span></div>
    <div class="math-op green">→ -10%</div>
    <div class="math-box"><span class="bright">900 B</span><br><span class="dim" style="font-size:0.7rem">CBOR</span></div>
    <div class="math-op green">→ -55%</div>
    <div class="math-box"><span class="bright">405 B</span><br><span class="dim" style="font-size:0.7rem">Gzip L6</span></div>
    <div class="math-op red">→ +36.5%</div>
    <div class="math-box"><span class="bright">553 B</span><br><span class="dim" style="font-size:0.7rem">Base58</span></div>
    <div class="math-op accent">≤ 566</div>
    <div class="math-box" style="border-color: var(--green);"><span class="green bold">1 tx!</span><br><span class="dim" style="font-size:0.7rem">Fits in memo</span></div>
  </div>
  <div class="three-col">
    <div class="card">
      <h3 style="color: var(--green);">Net Ratio</h3>
      <div class="stat-value" style="font-size: 2rem;">~0.54x</div>
      <p class="mt-1">Original content shrinks to roughly half — then Base58 adds back overhead. Net: about 55% of original size in the memo.</p>
    </div>
    <div class="card">
      <h3 style="color: var(--amber);">Cost Per Block</h3>
      <div class="stat-value" style="font-size: 2rem;">~5000</div>
      <p class="mt-1">lamports per transaction. A 10-block document costs about a penny.</p>
    </div>
    <div class="card">
      <h3 style="color: var(--cyan);">Tx Count Formula</h3>
      <p class="mono mt-1" style="font-size: 0.85rem;">
        blocks<br>
        + spillover_chunks<br>
        + ceil(blocks / 5)<br>
        + 1 scroll<br>
        = total txs
      </p>
    </div>
  </div>
</div>`,

// ═══════════════════════════════════════════════════════
// SLIDE 12 — End
// ═══════════════════════════════════════════════════════
`<div class="section-divider">
  <h1>Questions?</h1>
  <p class="subtitle mt-2">Glyffiti Inscription Pipeline</p>
  <div class="stat-grid mt-3" style="max-width: 900px;">
    <div class="stat">
      <div class="stat-value" style="font-size: 1.05rem; white-space: nowrap;">glyffiti-mobile.vercel.app</div>
      <div class="stat-label">Try It</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="font-size: 1.05rem; white-space: nowrap;">github.com/OnionDAO-git</div>
      <div class="stat-label">Source</div>
    </div>
  </div>
</div>`,

]
