/* ============================================================
   Game Room — shared 4-quadrant mission interface for all tracks
   ============================================================ */

import { loadAllMissions, isCompleted, completeMission, getCompletedCount } from './missions.js';
import { addXP, getProfile, checkBadges } from './gamification.js';
import { getDaysRemaining, getCampaignDay, generateAvatar } from '../app.js';

/**
 * Render the Game Room UI into a container.
 * @param {HTMLElement} container
 * @param {Object} config - { trackName, trackColor, trackSlug, headerClass }
 */
export async function renderGameRoom(container, config) {
  const { trackName, trackColor, trackSlug, headerClass } = config;

  const allDays = await loadAllMissions();
  const today = new Date().toISOString().slice(0, 10);

  // Filter missions for this track
  const trackDays = allDays.filter(d => d.track === trackSlug || d.track === 'both');

  // Today's missions: from the current or most recent past day
  const todayEntry = findTodayEntry(trackDays, today);
  const todayMissions = todayEntry ? (todayEntry.missions || []) : [];

  // Upcoming missions: next 7 days
  const upcomingDays = trackDays
    .filter(d => d.date > today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 7);

  // Load events
  let events = [];
  try {
    const res = await fetch('/events.json');
    events = await res.json();
  } catch (e) { /* ok */ }

  // Load legislators for briefing panel
  let legislators = [];
  try {
    const res = await fetch('/legislators.json');
    legislators = await res.json();
  } catch (e) { /* ok */ }

  container.innerHTML = `
    <div class="gameroom ${headerClass || ''}">
      <div class="gameroom-header" style="border-left-color: ${trackColor}">
        <div class="gameroom-header-left">
          <a href="#/" class="gameroom-back">&larr; Back</a>
          <h2 class="gameroom-track-name" style="color: ${trackColor}">${trackName}</h2>
        </div>
        <div class="gameroom-header-right">
          <span class="gameroom-day">Day ${getCampaignDay()}</span>
          <span class="gameroom-countdown">${getDaysRemaining()}d remaining</span>
        </div>
      </div>

      <div class="gameroom-grid">
        <!-- Top-left: Today's Missions -->
        <div class="gameroom-panel">
          <div class="panel-header">
            <h3 class="panel-title">Today's Missions</h3>
            <span class="panel-badge">${todayMissions.filter(m => isCompleted(m.id)).length}/${todayMissions.length}</span>
          </div>
          <div class="panel-body gameroom-missions" id="gr-missions-${trackSlug}">
            ${todayMissions.length === 0
              ? '<p class="panel-empty">No missions scheduled for today.</p>'
              : todayMissions.map(m => renderMissionRow(m, trackSlug)).join('')
            }
          </div>
        </div>

        <!-- Top-right: Mission Briefing -->
        <div class="gameroom-panel">
          <div class="panel-header">
            <h3 class="panel-title">Mission Briefing</h3>
          </div>
          <div class="panel-body briefing-panel" id="gr-briefing-${trackSlug}">
            <p class="panel-empty briefing-placeholder">Select a mission to see the briefing.</p>
          </div>
        </div>

        <!-- Bottom-left: Upcoming Missions -->
        <div class="gameroom-panel">
          <div class="panel-header">
            <h3 class="panel-title">Upcoming Missions</h3>
            <span class="panel-badge-muted">Next 7 days</span>
          </div>
          <div class="panel-body" id="gr-upcoming-${trackSlug}">
            ${upcomingDays.length === 0
              ? '<p class="panel-empty">No upcoming missions scheduled.</p>'
              : upcomingDays.map(day => renderUpcomingDay(day)).join('')
            }
          </div>
        </div>

        <!-- Bottom-right: Campaign Timeline -->
        <div class="gameroom-panel">
          <div class="panel-header">
            <h3 class="panel-title">Campaign Timeline</h3>
          </div>
          <div class="panel-body timeline-compact" id="gr-timeline-${trackSlug}">
            ${events.map(ev => renderTimelineItem(ev)).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach event listeners
  attachMissionListeners(container, trackSlug, todayMissions, legislators, config);
}

function findTodayEntry(trackDays, today) {
  // Exact match first
  let entry = trackDays.find(d => d.date === today);
  if (entry) return entry;

  // Most recent past entry
  const pastEntries = trackDays
    .filter(d => d.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return pastEntries[0] || null;
}

function renderMissionRow(m, trackSlug) {
  const done = isCompleted(m.id);
  return `
    <div class="mission-row ${done ? 'mission-done' : ''}" data-mission-id="${m.id}" data-mission-target="${m.legislator || ''}">
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

function renderUpcomingDay(day) {
  const dateStr = formatShortDate(day.date);
  const missions = day.missions || [];
  return `
    <div class="upcoming-day">
      <span class="upcoming-date">${dateStr}</span>
      <div class="upcoming-items">
        ${missions.map(m => `
          <span class="upcoming-item upcoming-${m.type}">
            ${m.title} <span class="mission-row-xp">+${m.xp}</span>
          </span>
        `).join('')}
      </div>
    </div>
  `;
}

function renderTimelineItem(ev) {
  const isPast = ev.past;
  const isUrgent = ev.urgent;
  const dot = isPast ? '&#9679;' : '&#9675;';
  const dateStr = formatShortDate(ev.date);

  let dotClass = 'timeline-dot-future';
  if (isPast) dotClass = 'timeline-dot-past';
  if (isUrgent) dotClass = 'timeline-dot-urgent';

  return `
    <div class="timeline-compact-item ${isPast ? 'is-past' : ''}">
      <span class="${dotClass}">${dot}</span>
      <span class="timeline-compact-date">${dateStr}</span>
      <span class="timeline-compact-title ${isUrgent ? 'timeline-urgent-text' : ''}">${ev.title}</span>
    </div>
  `;
}

function attachMissionListeners(container, trackSlug, todayMissions, legislators, config) {
  const missionsPanel = container.querySelector(`#gr-missions-${trackSlug}`);
  const briefingPanel = container.querySelector(`#gr-briefing-${trackSlug}`);

  if (!missionsPanel || !briefingPanel) return;

  // Click on mission row to show briefing
  missionsPanel.querySelectorAll('.mission-row').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('click', (e) => {
      // Don't trigger if clicking the Done button or phone link
      if (e.target.closest('.mission-complete-btn') || e.target.closest('a')) return;

      const missionId = row.dataset.missionId;
      const mission = todayMissions.find(m => m.id === missionId);
      if (mission) {
        renderBriefing(briefingPanel, mission, legislators);
        // Highlight selected row
        missionsPanel.querySelectorAll('.mission-row').forEach(r => r.classList.remove('mission-selected'));
        row.classList.add('mission-selected');
      }
    });
  });

  // Done buttons
  missionsPanel.querySelectorAll('.mission-complete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.missionId;
      const xp = parseInt(btn.dataset.xp, 10);
      completeMission(id);
      addXP(xp);

      const profile = getProfile();
      const completedCount = getCompletedCount();
      checkBadges(profile, completedCount);

      // Re-render the game room
      renderGameRoom(container, config);
    });
  });
}

function renderBriefing(panel, mission, legislators) {
  // Try to find a matching legislator
  const targetName = mission.legislator || mission.target || '';
  const legislator = targetName
    ? legislators.find(l => l.name.toLowerCase().includes(targetName.toLowerCase()) ||
        targetName.toLowerCase().includes(l.name.toLowerCase().split(' ').pop()))
    : null;

  if (legislator) {
    const photoSlug = legislator.name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '-');
    const partyClass = legislator.party === 'D' ? 'dem' : 'rep';
    const partyLabel = legislator.party === 'D' ? 'DEM' : 'GOP';
    const avatarSvg = generateAvatar(legislator.name, legislator.party);
    const address = legislator.contact?.address || '';
    const phone = legislator.contact?.district || legislator.contact?.springfield || '';

    panel.innerHTML = `
      <div class="briefing-target">
        <div class="briefing-photo-row">
          <div class="briefing-photo">
            <img src="/photos/legislators/${photoSlug}.jpg" width="64" height="64" alt="${legislator.name}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
            <span class="briefing-avatar-fallback" style="display:none">${avatarSvg}</span>
          </div>
          <div class="briefing-target-info">
            <h4 class="briefing-target-name">${legislator.name}</h4>
            <div class="briefing-meta">
              <span class="party-badge ${partyClass}">${partyLabel}</span>
              <span class="briefing-district">D-${legislator.district}</span>
              ${legislator.role !== 'Member' ? `<span class="role-badge">${legislator.role}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="briefing-leverage">${legislator.leverage}</div>
        <div class="briefing-contact">
          ${address ? `<a href="https://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank" rel="noopener" class="briefing-contact-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            ${address}
          </a>` : ''}
          ${phone ? `<a href="tel:${phone}" class="briefing-contact-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            ${phone}
          </a>` : ''}
        </div>
      </div>
      ${mission.script ? `
        <div class="briefing-script">
          <h5 class="briefing-script-title">Call Script</h5>
          <p class="briefing-script-text">${mission.script}</p>
        </div>
      ` : ''}
    `;
  } else {
    // No legislator match — show mission details
    panel.innerHTML = `
      <div class="briefing-mission-detail">
        <h4 class="briefing-target-name">${mission.title}</h4>
        <p class="briefing-description">${mission.description}</p>
        ${mission.script ? `
          <div class="briefing-script">
            <h5 class="briefing-script-title">Script / Template</h5>
            <p class="briefing-script-text">${mission.script}</p>
          </div>
        ` : ''}
        ${mission.tips ? `
          <div class="briefing-tips">
            <h5 class="briefing-script-title">Tips</h5>
            <ul>${mission.tips.map(t => `<li>${t}</li>`).join('')}</ul>
          </div>
        ` : ''}
      </div>
    `;
  }
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
