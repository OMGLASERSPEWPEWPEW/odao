import { getCompletedMissions } from '../lib/missions.js';
import { getProfile, BADGE_DEFS } from '../lib/gamification.js';
import { supabase } from '../lib/supabase.js';

const ACTIVITY_KEY = 'repeal-data-activity';

function getLocalActivity() {
  try { return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || []; }
  catch { return []; }
}

function buildLocalTimeline() {
  const entries = [];
  const completed = getCompletedMissions();
  completed.forEach(m => {
    entries.push({
      type: 'mission_complete',
      label: `Completed mission #${m.id}`,
      timestamp: m.completedAt,
      icon: 'check',
    });
  });

  const stored = getLocalActivity();
  stored.forEach(a => {
    entries.push({
      type: a.type,
      label: a.label || a.type.replace(/_/g, ' '),
      timestamp: a.timestamp,
      icon: a.icon || 'circle',
    });
  });

  return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function formatTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function getIcon(type) {
  switch (type) {
    case 'mission_complete': return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    case 'bounty_claimed': return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2" width="16" height="16"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
    case 'badge_earned': return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2" width="16" height="16"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
    case 'idea_submitted': return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" stroke-width="2" width="16" height="16"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>';
    default: return '<svg viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="4"/></svg>';
  }
}

export async function renderActivity() {
  const container = document.getElementById('page-activity');
  const localEntries = buildLocalTimeline();

  let globalEntries = [];
  try {
    const { data } = await supabase
      .from('campaign_activity')
      .select('type, data, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) {
      globalEntries = data.map(r => ({
        type: r.type,
        label: r.data?.label || r.type.replace(/_/g, ' '),
        timestamp: r.created_at,
        global: true,
      }));
    }
  } catch { /* supabase unavailable */ }

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">ENGAGE</p>
        <h1 class="page-title">Activity Feed</h1>
        <p class="page-subtitle">Everything happening in the campaign</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="activity-tabs">
          <button class="filter-pill active" data-tab="personal">Your Activity</button>
          <button class="filter-pill" data-tab="global">Global Feed</button>
        </div>

        <div class="activity-timeline" id="personalFeed">
          ${localEntries.length > 0 ? localEntries.map(e => `
            <div class="activity-timeline-item">
              <div class="activity-timeline-icon">${getIcon(e.type)}</div>
              <div class="activity-timeline-content">
                <span class="activity-timeline-label">${e.label}</span>
                <span class="activity-timeline-time">${formatTime(e.timestamp)}</span>
              </div>
            </div>
          `).join('') : '<p class="empty-state">No activity yet. Complete a mission or claim a bounty to get started!</p>'}
        </div>

        <div class="activity-timeline" id="globalFeed" style="display:none">
          ${globalEntries.length > 0 ? globalEntries.map(e => `
            <div class="activity-timeline-item">
              <div class="activity-timeline-icon">${getIcon(e.type)}</div>
              <div class="activity-timeline-content">
                <span class="activity-timeline-label">${e.label}</span>
                <span class="activity-timeline-time">${formatTime(e.timestamp)}</span>
              </div>
            </div>
          `).join('') : '<p class="empty-state">No global activity yet. Be the first!</p>'}
        </div>
      </div>
    </section>
  `;

  container.querySelectorAll('.activity-tabs .filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.activity-tabs .filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.getElementById('personalFeed').style.display = tab === 'personal' ? '' : 'none';
      document.getElementById('globalFeed').style.display = tab === 'global' ? '' : 'none';
    });
  });
}
