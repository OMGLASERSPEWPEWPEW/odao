/* ============================================================
   War Room Dashboard — 4-panel command center
   ============================================================ */

import { loadMissions, getTodayMissions, getUpcomingMissions, isCompleted, completeMission } from '../lib/missions.js';
import { getProfile, getLevel, addXP } from '../lib/gamification.js';
import { getDaysRemaining, getCampaignDay } from '../app.js';

export async function renderLanding() {
  const container = document.getElementById('page-landing');
  const profile = getProfile();
  const level = getLevel(profile.xp);

  const allDays = await loadMissions();
  const todayMissions = getTodayMissions(allDays);
  const upcomingDays = getUpcomingMissions(allDays);
  const completedToday = todayMissions.filter(m => isCompleted(m.id)).length;
  const totalToday = todayMissions.length;

  let scrawlEntries = [];
  try {
    const res = await fetch('/scrawl.json');
    const scrawl = await res.json();
    scrawlEntries = scrawl.entries || [];
  } catch (e) { /* placeholder not available yet */ }

  let briefingSummary = '';
  try {
    const res = await fetch('/briefings.json');
    const briefings = await res.json();
    const today = new Date().toISOString().split('T')[0];
    const todayBriefing = briefings.find(b => b.date === today) || briefings[briefings.length - 1];
    if (todayBriefing) {
      briefingSummary = todayBriefing.greeting + ' ' + (todayBriefing.sections[0]?.text || '');
    }
  } catch (e) { /* ok */ }

  const recentCompleted = profile.completedMissions
    ? profile.completedMissions.slice(-5).reverse()
    : [];

  container.innerHTML = `
    <div class="warroom-header">
      <div class="container">
        <div class="warroom-title-row">
          <div>
            <h1 class="warroom-title">Campaign War Room</h1>
            <p class="warroom-subtitle">Day ${getCampaignDay()} &middot; ${getDaysRemaining()} days until tax takes effect</p>
          </div>
          <div class="warroom-stats">
            <span class="warroom-stat">${profile.streak > 0 ? '<span class="flame">&#128293;</span>' : ''} ${profile.streak}d streak</span>
            <span class="warroom-stat">LVL ${level}</span>
            <span class="warroom-stat">${profile.xp} XP</span>
          </div>
        </div>
      </div>
    </div>

    <div class="container warroom-container">
      <div class="warroom-grid">

        <!-- Panel 1: Active Missions -->
        <div class="warroom-panel">
          <div class="panel-header">
            <h2 class="panel-title">Active Missions</h2>
            <span class="panel-badge">${completedToday}/${totalToday}</span>
          </div>
          <div class="panel-body" id="active-missions-body">
            ${totalToday === 0
              ? '<p class="panel-empty">No missions scheduled today. Visit the <a href="#/repeal">Repeal</a> or <a href="#/carveout">Carve-Out</a> track for actions.</p>'
              : todayMissions.map(m => renderMissionCard(m)).join('')
            }
          </div>
        </div>

        <!-- Panel 2: Situation Report -->
        <div class="warroom-panel">
          <div class="panel-header">
            <h2 class="panel-title">Situation Report</h2>
            <a href="#/briefing" class="panel-link">Full briefing &rarr;</a>
          </div>
          <div class="panel-body">
            ${briefingSummary
              ? `<div class="sitrep-briefing"><p>${briefingSummary}</p></div>`
              : ''
            }
            <div class="sitrep-scrawl">
              <h3 class="scrawl-title">Latest Intel</h3>
              ${scrawlEntries.slice(0, 3).map(e => `
                <div class="scrawl-entry">
                  <span class="scrawl-source scrawl-${e.relevance}">${e.source}</span>
                  <a href="${e.url}" target="_blank" rel="noopener" class="scrawl-headline">${e.headline}</a>
                  <span class="scrawl-date">${formatShortDate(e.date)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Panel 3: Upcoming Ops -->
        <div class="warroom-panel">
          <div class="panel-header">
            <h2 class="panel-title">Upcoming Ops</h2>
            <span class="panel-badge-muted">Next 7 days</span>
          </div>
          <div class="panel-body">
            ${upcomingDays.length === 0
              ? '<p class="panel-empty">No upcoming missions scheduled.</p>'
              : upcomingDays.slice(0, 5).map(day => `
                <div class="upcoming-day">
                  <span class="upcoming-date">${formatShortDate(day.date)}</span>
                  <div class="upcoming-items">
                    ${day.missions.map(m => `
                      <span class="upcoming-item upcoming-${m.type}">${m.title}</span>
                    `).join('')}
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>

        <!-- Panel 4: Campaign Log -->
        <div class="warroom-panel">
          <div class="panel-header">
            <h2 class="panel-title">Campaign Log</h2>
            <a href="#/profile" class="panel-link">Profile &rarr;</a>
          </div>
          <div class="panel-body">
            <div class="log-entries">
              ${recentCompleted.length === 0
                ? '<p class="panel-empty">No completed missions yet. Start your first one above.</p>'
                : recentCompleted.map(id => `
                  <div class="log-entry">
                    <span class="log-check">&#10003;</span>
                    <span class="log-id">${id.replace(/-/g, ' ')}</span>
                  </div>
                `).join('')
              }
            </div>
            <div class="log-summary">
              <span>Level ${level}</span>
              <span>&middot;</span>
              <span>${profile.xp} XP</span>
              <span>&middot;</span>
              <span>${profile.streak}d ${profile.streak > 0 ? '&#128293;' : ''}</span>
              <span>&middot;</span>
              <span>${profile.badges?.length || 0} badges</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Track buttons (demoted from hero cards) -->
      <div class="track-buttons">
        <a href="#/repeal" class="track-btn track-btn-repeal">
          <span class="track-btn-label">Repeal Track</span>
          <span class="track-btn-desc">Kill the whole tax &rarr;</span>
        </a>
        <a href="#/carveout" class="track-btn track-btn-carveout">
          <span class="track-btn-label">Carve-Out Track</span>
          <span class="track-btn-desc">Protect community events &rarr;</span>
        </a>
      </div>
    </div>
  `;

  container.querySelectorAll('.mission-complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.missionId;
      const xp = parseInt(btn.dataset.xp, 10);
      completeMission(id);
      addXP(xp);
      renderLanding();
    });
  });
}

function renderMissionCard(m) {
  const done = isCompleted(m.id);
  return `
    <div class="mission-row ${done ? 'mission-done' : ''}">
      <div class="mission-row-icon">${getMissionIcon(m.type)}</div>
      <div class="mission-row-info">
        <span class="mission-row-title">${m.title}</span>
        ${m.phone ? `<a href="tel:${m.phone}" class="mission-row-phone">${m.phone}</a>` : ''}
      </div>
      <span class="mission-row-xp">+${m.xp}</span>
      ${done
        ? '<span class="mission-row-check">&#10003;</span>'
        : `<button class="mission-complete-btn" data-mission-id="${m.id}" data-xp="${m.xp}">Done</button>`
      }
    </div>
  `;
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function getMissionIcon(type) {
  const icons = {
    call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    visit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    social: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>',
    research: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    recruit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  };
  return icons[type] || icons.research;
}
