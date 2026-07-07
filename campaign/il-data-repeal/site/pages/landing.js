/* ============================================================
   Landing Page — 3-card track choice screen
   ============================================================ */

import { getProfile, getLevel } from '../lib/gamification.js';
import { getDaysRemaining, getCampaignDay } from '../app.js';
import { renderSharedSections, buildLegislatorCardHTML } from '../lib/shared-sections.js';
import { supabase } from '../lib/supabase.js';

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


        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Activity</h2>
        <div id="activity-feed" class="activity-feed">
          <p class="activity-feed-loading">Loading activity...</p>
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

  // Activity feed
  loadActivityFeed(container);

  // Zip code lookup
  initZipLookup();
}

async function loadActivityFeed(container) {
  const feed = container.querySelector('#activity-feed');
  if (!feed) return;

  try {
    const { data } = await supabase
      .from('campaign_activity')
      .select('data, created_at')
      .eq('type', 'bounty_claimed')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!data || data.length === 0) {
      feed.innerHTML = '<p class="activity-feed-empty">No activity yet. Claim a quest to get started.</p>';
      return;
    }

    feed.innerHTML = data.map(row => {
      const d = row.data || {};
      const date = new Date(row.created_at);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const who = d.volunteer || 'anonymous';
      const quest = d.bounty || 'Unknown quest';
      const notes = d.notes ? d.notes.replace(/</g, '&lt;') : null;
      const hasNotes = !!notes;

      return `
        <div class="activity-item ${hasNotes ? 'has-notes' : ''}">
          <div class="activity-item-row">
            <span class="activity-date">${dateStr} ${timeStr}</span>
            <span class="activity-user">${who}</span>
            <span class="activity-quest">${quest}</span>
            ${hasNotes ? '<button class="activity-expand-btn" aria-label="Show notes">+</button>' : ''}
          </div>
          ${hasNotes ? `<div class="activity-notes">${notes}</div>` : ''}
        </div>
      `;
    }).join('');

    feed.querySelectorAll('.activity-expand-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.activity-item');
        const open = item.classList.toggle('open');
        btn.textContent = open ? '−' : '+';
      });
    });
  } catch {
    feed.innerHTML = '<p class="activity-feed-empty">Could not load activity.</p>';
  }
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
