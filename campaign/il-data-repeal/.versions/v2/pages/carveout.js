/* ============================================================
   Carve-Out Page — community event exemption track
   ============================================================ */

import { loadMissions, getTodayMissions, isCompleted, completeMission, getCompletedCount } from '../lib/missions.js';
import { addXP, getProfile, checkBadges } from '../lib/gamification.js';

let carveoutData = null;

async function loadCarveoutData() {
  if (carveoutData) return carveoutData;
  try {
    const res = await fetch('/carveout.json');
    carveoutData = await res.json();
    return carveoutData;
  } catch (err) {
    console.error('Failed to load carveout data:', err);
    return null;
  }
}

export async function renderCarveout() {
  const container = document.getElementById('page-carveout');
  const data = await loadCarveoutData();
  const allDays = await loadMissions();
  // Show missions from days with track "both" or "carveout" (there's no explicit carveout track yet,
  // but "both" missions apply here)
  const todayMissions = getTodayMissions(allDays);

  if (!data) {
    container.innerHTML = `
      <div class="container" style="padding:80px 20px;text-align:center;">
        <p style="color:var(--red)">Failed to load carve-out campaign data.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <header class="page-header carveout-header">
      <div class="container">
        <p class="page-eyebrow">TRACK: COMMUNITY CARVE-OUT</p>
        <h1 class="page-title">Protect Community Events</h1>
        <p class="page-subtitle">${data.subtitle}</p>
      </div>
    </header>

    <!-- Today's Missions -->
    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Today's Missions</h2>
        <div class="missions-grid" id="carveout-missions">
          ${todayMissions.length > 0
            ? todayMissions.map(m => renderMissionCard(m)).join('')
            : '<p class="no-missions">No missions scheduled for today. Check back tomorrow!</p>'
          }
        </div>
      </div>
    </section>

    <!-- Action Plan -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Carve-Out Action Plan</h2>
        <p class="section-subtitle">Secure an exemption for community events.</p>
        <div class="carveout-actions-grid">
          ${data.actionPlan.map((item, i) => `
            <div class="carveout-action-card">
              <div class="carveout-action-number">${i + 1}</div>
              <h3>${item.title}</h3>
              <p>${item.description}</p>
              <div class="carveout-action-status" data-status="${item.status}">
                <span class="action-status-dot"></span>
                ${item.status.replace(/-/g, ' ').toUpperCase()}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Talking Points -->
    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Talking Points</h2>
        <p class="section-subtitle">Use these when meeting with legislators or writing letters.</p>
        <div class="talking-points-grid">
          ${data.talkingPoints.map(point => `
            <div class="talking-point-card">
              <div class="talking-point-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <p>${point}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- Testimony Angle -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Your Testimony Angle</h2>
        <div class="testimony-card">
          <div class="testimony-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <h3>The Community Story</h3>
          <p>${data.testimonyAngle}</p>
        </div>
      </div>
    </section>

    <!-- Fallback Strategy -->
    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Fallback Strategy</h2>
        <div class="fallback-card">
          <p>${data.fallbackStrategy}</p>
        </div>
      </div>
    </section>
  `;

  // Attach mission handlers
  container.querySelectorAll('.mission-complete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.missionId;
      const xp = parseInt(btn.dataset.xp, 10);
      handleMissionComplete(id, xp, btn);
    });
  });
}

function renderMissionCard(mission) {
  const completed = isCompleted(mission.id);
  const difficultyClass = `difficulty-${mission.difficulty || 'easy'}`;

  return `
    <div class="mission-card ${completed ? 'mission-completed' : ''} ${difficultyClass}">
      <div class="mission-card-header">
        <span class="mission-type-badge">${(mission.type || 'action').toUpperCase()}</span>
        <span class="mission-xp-badge">+${mission.xp} XP</span>
      </div>
      <h4 class="mission-card-title">${mission.title}</h4>
      <p class="mission-card-desc">${mission.description}</p>
      ${mission.script ? `
        <details class="mission-script-details">
          <summary>View Script</summary>
          <div class="mission-script-content">${mission.script}</div>
        </details>
      ` : ''}
      <div class="mission-card-footer">
        <span class="mission-difficulty">${(mission.difficulty || 'easy').toUpperCase()}</span>
        ${completed
          ? '<span class="mission-done-badge">COMPLETED</span>'
          : `<button class="mission-complete-btn" data-mission-id="${mission.id}" data-xp="${mission.xp}">Mark Complete</button>`
        }
      </div>
    </div>
  `;
}

function handleMissionComplete(id, xp, btn) {
  completeMission(id);
  addXP(xp);
  const profile = getProfile();
  const completedCount = getCompletedCount();
  checkBadges(profile, completedCount);

  const card = btn.closest('.mission-card');
  card.classList.add('mission-completed');
  btn.outerHTML = '<span class="mission-done-badge">COMPLETED</span>';
}
