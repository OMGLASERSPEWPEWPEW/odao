/* ============================================================
   Profile Page — gamification stats, badges, activity log
   ============================================================ */

import { getProfile, getLevel, getXPProgress, getXPForNextLevel, BADGE_DEFS } from '../lib/gamification.js';
import { getCompletedMissions } from '../lib/missions.js';

export function renderProfile() {
  const container = document.getElementById('page-profile');
  const profile = getProfile();
  const level = getLevel(profile.xp);
  const progress = getXPProgress(profile.xp);
  const nextLevelXP = getXPForNextLevel(profile.xp);
  const completedMissions = getCompletedMissions();

  // Last 10 completed missions
  const recentActivity = completedMissions
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
    .slice(0, 10);

  container.innerHTML = `
    <header class="page-header profile-header">
      <div class="container">
        <p class="page-eyebrow">YOUR PROFILE</p>
        <h1 class="page-title">Campaign Progress</h1>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="profile-stats-grid">
          <!-- XP & Level -->
          <div class="profile-stat-card profile-xp-card">
            <div class="profile-level-circle">
              <span class="profile-level-number">${level}</span>
              <span class="profile-level-label">LEVEL</span>
            </div>
            <div class="profile-xp-info">
              <div class="profile-xp-number">${profile.xp} XP</div>
              <div class="profile-xp-bar-track">
                <div class="profile-xp-bar-fill" style="width: ${progress * 100}%"></div>
              </div>
              <div class="profile-xp-next">${nextLevelXP - profile.xp} XP to next level</div>
            </div>
          </div>

          <!-- Streak -->
          <div class="profile-stat-card profile-streak-card">
            <div class="profile-streak-flame">${profile.streak > 0 ? '&#128293;' : '&#9898;'}</div>
            <div class="profile-streak-number">${profile.streak}</div>
            <div class="profile-streak-label">DAY STREAK</div>
            <div class="profile-streak-sub">${getStreakMessage(profile.streak)}</div>
          </div>

          <!-- Missions Count -->
          <div class="profile-stat-card">
            <div class="profile-stat-big">${completedMissions.length}</div>
            <div class="profile-stat-label">MISSIONS COMPLETED</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Badges -->
    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Badges</h2>
        <p class="section-subtitle">${profile.badges.length}/${BADGE_DEFS.length} earned</p>
        <div class="badges-grid">
          ${BADGE_DEFS.map(badge => {
            const earned = profile.badges.includes(badge.id);
            return `
              <div class="badge-card ${earned ? 'badge-earned' : 'badge-locked'}">
                <div class="badge-icon">${getBadgeIcon(badge.icon, earned)}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    <!-- Activity Log -->
    <section class="section">
      <div class="container">
        <h2 class="section-title">Recent Activity</h2>
        ${recentActivity.length > 0 ? `
          <div class="activity-log">
            ${recentActivity.map(a => `
              <div class="activity-item">
                <div class="activity-check">&#10003;</div>
                <div class="activity-info">
                  <span class="activity-id">Mission #${a.id}</span>
                  <span class="activity-time">${formatActivityTime(a.completedAt)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="text-align:center;color:var(--text-dim);padding:40px 0;">No activity yet. Complete your first mission to get started!</p>
        `}
      </div>
    </section>
  `;
}

function getStreakMessage(streak) {
  if (streak === 0) return 'Start your streak today!';
  if (streak < 3) return 'Keep it going!';
  if (streak < 7) return 'Building momentum!';
  if (streak < 14) return 'On fire!';
  if (streak < 30) return 'Unstoppable force!';
  return 'LEGENDARY!';
}

function getBadgeIcon(icon, earned) {
  const color = earned ? 'currentColor' : 'var(--text-dim)';
  switch (icon) {
    case 'star': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    case 'flame': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><path d="M12 22c-4.97 0-9-2.69-9-6 0-3.5 2-6 4-8 0 0 1 3 3 4 0-4 2-8 6-10 0 3 2 6 2 9 2-1 3-3 3-3 1 2 2 4 2 6 0 4.5-3 8-9 8z"/></svg>`;
    case 'lightning': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
    case 'trophy': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>`;
    case 'shield': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    case 'check': return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    case 'crown': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><path d="M2 4l3 12h14l3-12-5 4-5-4-5 4-5-4z"/><path d="M3 20h18"/></svg>`;
    case 'diamond': return `<svg viewBox="0 0 24 24" fill="${earned ? color : 'none'}" stroke="${color}" stroke-width="2"><path d="M2.7 10.3a2.41 2.41 0 000 3.41l7.59 7.59a2.41 2.41 0 003.41 0l7.59-7.59a2.41 2.41 0 000-3.41L13.7 2.71a2.41 2.41 0 00-3.41 0L2.7 10.3z"/></svg>`;
    default: return `<svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
  }
}

function formatActivityTime(isoStr) {
  const d = new Date(isoStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
