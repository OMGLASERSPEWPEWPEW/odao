/* ============================================================
   Landing Page — 3-card track choice screen
   ============================================================ */

import { getProfile, getLevel } from '../lib/gamification.js';
import { getDaysRemaining, getCampaignDay } from '../app.js';

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

          <!-- Carve-Out Track -->
          <a href="#/carveout" class="track-choice-card track-choice-carveout">
            <div class="track-choice-accent" style="background: var(--green)"></div>
            <div class="track-choice-icon track-choice-icon-carveout">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3 class="track-choice-name">Carve-Out</h3>
            <p class="track-choice-desc">Protect community events. Secure an exemption for educational gatherings.</p>
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
            <p class="track-choice-desc">Prove crypto events generate more tax revenue than the DATA tax ever will.</p>
            <span class="track-choice-cta">Enter Game Room &rarr;</span>
          </a>

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
}
