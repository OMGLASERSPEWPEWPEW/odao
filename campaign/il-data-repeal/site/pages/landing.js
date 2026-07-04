/* ============================================================
   Landing Page — 3-card track choice screen
   ============================================================ */

import { getProfile, getLevel } from '../lib/gamification.js';
import { getDaysRemaining, getCampaignDay } from '../app.js';
import { renderSharedSections, buildLegislatorCardHTML } from '../lib/shared-sections.js';

export async function renderLanding() {
  const container = document.getElementById('page-landing');
  const profile = getProfile();
  const level = getLevel(profile.xp);

  container.innerHTML = `
    <header class="landing-header">
      <div class="container">
        <h1 class="landing-bill-title">SB 3019</h1>
        <p class="landing-bill-subtitle">Illinois Digital Asset Tax Act</p>
        <p class="landing-day-counter">Day ${getCampaignDay()} &middot; ${getDaysRemaining()} days remaining</p>
        <p class="landing-bill-explainer">SB 3019 is the tax. HB 5798 is the repeal. Pick a track to fight back.</p>
      </div>
    </header>

    <section class="landing-tracks">
      <div class="container">
        <div class="track-choice-grid">

          <!-- Repeal Track -->
          <a href="#/repeal" class="track-choice-card track-choice-repeal">
            <div class="track-choice-accent" style="background: var(--red)"></div>
            <div class="track-choice-icon track-choice-icon-repeal">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </div>
            <h3 class="track-choice-name">Repeal</h3>
            <p class="track-choice-desc">Kill the whole tax. Call legislators, visit offices, build the coalition.</p>
            <span class="track-choice-cta">Enter Game Room &rarr;</span>
          </a>

          <!-- Revenue Track -->
          <a href="#/revenue" class="track-choice-card track-choice-revenue">
            <div class="track-choice-accent" style="background: var(--gold)"></div>
            <div class="track-choice-icon track-choice-icon-revenue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <h3 class="track-choice-name">Tax Revenue Engine</h3>
            <p class="track-choice-desc">Show that this tax kills an economic engine for Chicago before it reaches its potential.</p>
            <span class="track-choice-cta">Enter Game Room &rarr;</span>
          </a>

        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="zip-lookup">
          <h3 class="zip-lookup-title">Find Your Representative</h3>
          <div class="zip-lookup-form">
            <input type="text" id="zip-input" class="zip-input" placeholder="Enter IL zip code" maxlength="5" pattern="[0-9]*" inputmode="numeric" />
            <button id="zip-lookup-btn" class="zip-lookup-btn">Look up</button>
          </div>
          <div id="zip-result" class="zip-result"></div>
          <p class="zip-fallback">Or <a href="https://ilga.gov/house/default.asp" target="_blank" rel="noopener">search by address at ilga.gov</a></p>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="container landing-footer-inner">
        <span class="landing-footer-stat">LVL ${level}</span>
        <span class="landing-footer-divider">&middot;</span>
        <span class="landing-footer-stat">${profile.xp} XP</span>
        <span class="landing-footer-divider">&middot;</span>
        <span class="landing-footer-stat">${profile.streak}d streak</span>
      </div>
    </footer>
  `;

  // Render shared sections (strategy, calendar, legislators, act now, vote math)
  await renderSharedSections(container);

  // Zip code lookup
  initZipLookup();
}

async function initZipLookup() {
  const btn = document.getElementById('zip-lookup-btn');
  const input = document.getElementById('zip-input');
  const result = document.getElementById('zip-result');
  if (!btn || !input || !result) return;

  let legislators = [];
  try {
    const res = await fetch('/legislators.json');
    legislators = await res.json();
  } catch (e) { return; }

  const lookup = () => {
    const zip = input.value.trim();
    if (zip.length !== 5) {
      result.innerHTML = '<p class="zip-error">Enter a 5-digit Illinois zip code.</p>';
      return;
    }

    const matches = legislators.filter(l => {
      const zips = l.zips || [];
      return zips.includes(zip);
    });

    if (matches.length > 0) {
      result.innerHTML = `
        <p class="zip-match-inline">Your area is represented by a Revenue Committee member:</p>
        <div class="zip-result-cards">
          ${matches.map(l => buildLegislatorCardHTML(l, { expanded: true })).join('')}
        </div>
      `;
    } else {
      result.innerHTML = `
        <div class="zip-no-match">
          <p>Your zip code doesn't match a Revenue Committee member's district — but you can still help.</p>
          <p>Call your own representative and ask them to support HB 5798. <a href="https://ilga.gov/house/default.asp" target="_blank" rel="noopener">Find your rep at ilga.gov &rarr;</a></p>
        </div>
      `;
    }
  };

  btn.addEventListener('click', lookup);
  input.addEventListener('keypress', (e) => { if (e.key === 'Enter') lookup(); });
}
