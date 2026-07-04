/* ============================================================
   Repeal Page — full repeal campaign track (refactored v1)
   ============================================================ */

import { loadMissions, getTodayMissions, isCompleted, completeMission, getCompletedCount } from '../lib/missions.js';
import { addXP, getProfile, checkBadges } from '../lib/gamification.js';

export async function renderRepeal() {
  const container = document.getElementById('repeal-missions');
  if (!container) return;

  const allDays = await loadMissions();
  // Get today's missions, only those for repeal or both tracks
  const todayMissions = getTodayMissions(allDays).filter(m => {
    // The day-level track is checked; individual missions don't have track field
    return true; // Show all today's missions on repeal page since missions.json uses day-level tracks
  });

  if (todayMissions.length === 0) {
    container.innerHTML = '<p class="no-missions">No missions scheduled for today. Check back tomorrow!</p>';
    return;
  }

  container.innerHTML = `
    <h3 class="missions-header">TODAY'S MISSIONS</h3>
    <div class="missions-grid">
      ${todayMissions.map(m => renderMissionCard(m)).join('')}
    </div>
  `;

  // Attach mission completion handlers
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
      ${mission.phone ? `<div class="mission-phone"><a href="tel:${mission.phone}">${mission.phone}</a></div>` : ''}
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

  // Animate button
  const card = btn.closest('.mission-card');
  card.classList.add('mission-completed');
  btn.outerHTML = '<span class="mission-done-badge">COMPLETED</span>';
}
