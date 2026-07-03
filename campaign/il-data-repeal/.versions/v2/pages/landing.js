/* ============================================================
   Landing Page — choose-your-adventure + today's missions
   ============================================================ */

import { loadMissions, getTodayMissions, isCompleted } from '../lib/missions.js';
import { getProfile, getLevel } from '../lib/gamification.js';

export async function renderLanding() {
  const container = document.getElementById('page-landing');
  const profile = getProfile();
  const level = getLevel(profile.xp);

  // Load missions for today's card
  const allDays = await loadMissions();
  const todayMissions = getTodayMissions(allDays);
  const completedToday = todayMissions.filter(m => isCompleted(m.id)).length;

  container.innerHTML = `
    <header class="hero landing-hero" id="header">
      <div class="hero-content">
        <p class="hero-eyebrow">Illinois Digital Asset Tax Act (SB 3019)</p>
        <h1 class="hero-title">STOP THE IL<br/>DIGITAL ASSET TAX</h1>
        <p class="hero-subtitle">0.2% on every transaction. Not profits &mdash; <em>every single transaction.</em></p>
        <div class="countdown" id="countdown">
          <div class="countdown-block">
            <span class="countdown-number" id="cd-days">---</span>
            <span class="countdown-label">DAYS</span>
          </div>
          <div class="countdown-sep">:</div>
          <div class="countdown-block">
            <span class="countdown-number" id="cd-hours">--</span>
            <span class="countdown-label">HOURS</span>
          </div>
          <div class="countdown-sep">:</div>
          <div class="countdown-block">
            <span class="countdown-number" id="cd-minutes">--</span>
            <span class="countdown-label">MINUTES</span>
          </div>
          <div class="countdown-sep">:</div>
          <div class="countdown-block">
            <span class="countdown-number" id="cd-seconds">--</span>
            <span class="countdown-label">SECONDS</span>
          </div>
        </div>
        <p class="countdown-caption">until the tax takes effect on January 1, 2027</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Choose Your Track</h2>
        <p class="section-subtitle">Two paths to fight back. Pick the one that matches your strategy.</p>

        <div class="track-grid">
          <a href="#/repeal" class="track-card track-repeal">
            <div class="track-accent"></div>
            <div class="track-content">
              <div class="track-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"/>
                </svg>
              </div>
              <h3>REPEAL</h3>
              <p class="track-desc">Kill the whole tax. Support HB 5798.</p>
              <span class="track-cta">Enter Campaign &rarr;</span>
            </div>
          </a>

          <a href="#/carveout" class="track-card track-carveout">
            <div class="track-accent"></div>
            <div class="track-content">
              <div class="track-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>CARVE OUT</h3>
              <p class="track-desc">Protect community events. Lobby for an exemption.</p>
              <span class="track-cta">Enter Campaign &rarr;</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Today's Missions</h2>
        <p class="section-subtitle">${completedToday}/${todayMissions.length} completed today</p>
        <div class="mission-preview-grid">
          ${todayMissions.slice(0, 3).map(m => `
            <div class="mission-preview-card ${isCompleted(m.id) ? 'completed' : ''}">
              <div class="mission-preview-icon">${getMissionIcon(m.type)}</div>
              <div class="mission-preview-info">
                <h4>${m.title}</h4>
                <span class="mission-xp-badge">+${m.xp} XP</span>
              </div>
              ${isCompleted(m.id) ? '<div class="mission-check">&#10003;</div>' : ''}
            </div>
          `).join('')}
          ${todayMissions.length === 0 ? '<p class="no-missions">No missions scheduled. Check the Repeal or Carve-Out tracks!</p>' : ''}
        </div>
      </div>
    </section>

    <div class="xp-summary-bar">
      <div class="container xp-bar-inner">
        <div class="xp-bar-left">
          <span class="xp-bar-flame">${profile.streak > 0 ? '&#128293;' : ''}</span>
          <span class="xp-bar-streak">${profile.streak} day streak</span>
        </div>
        <div class="xp-bar-right">
          <span class="xp-bar-level">LVL ${level}</span>
          <span class="xp-bar-xp">${profile.xp} XP</span>
        </div>
        <a href="#/profile" class="xp-bar-profile-link">Profile &rarr;</a>
      </div>
    </div>
  `;
}

function getMissionIcon(type) {
  switch (type) {
    case 'call': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
    case 'social': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    case 'research': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    case 'attend':
    case 'visit': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>';
    case 'write':
    case 'email': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
    case 'recruit': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>';
    default: return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
}
