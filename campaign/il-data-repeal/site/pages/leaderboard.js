import { getProfile, getLevel, BADGE_DEFS } from '../lib/gamification.js';
import { getCompletedCount } from '../lib/missions.js';
import { supabase, getUser } from '../lib/supabase.js';

export async function renderLeaderboard() {
  const container = document.getElementById('page-leaderboard');
  const profile = getProfile();
  const level = getLevel(profile.xp);
  const completed = getCompletedCount();
  const user = await getUser();

  let leaderboard = [];
  let usernameMap = {};

  try {
    const [activityRes, volunteersRes] = await Promise.all([
      supabase.from('campaign_activity').select('volunteer_id, data').order('created_at', { ascending: false }),
      supabase.from('campaign_volunteers').select('id, username'),
    ]);

    if (volunteersRes.data) {
      volunteersRes.data.forEach(v => {
        if (v.username) usernameMap[v.id] = v.username;
      });
    }

    if (activityRes.data) {
      const byVolunteer = {};
      activityRes.data.forEach(r => {
        const vid = r.volunteer_id;
        if (!byVolunteer[vid]) byVolunteer[vid] = { id: vid, xp: 0, actions: 0 };
        byVolunteer[vid].actions++;
        byVolunteer[vid].xp += (r.data?.xp || 10);
      });
      leaderboard = Object.values(byVolunteer)
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 20);
    }
  } catch { /* supabase unavailable */ }

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">ENGAGE</p>
        <h1 class="page-title">Leaderboard</h1>
        <p class="page-subtitle">Top campaign volunteers</p>
      </div>
    </header>

    ${user ? `
    <section class="section">
      <div class="container">
        <div class="leaderboard-your-stats">
          <h2 class="section-title">${user.username}'s Stats</h2>
          <div class="profile-stats-grid">
            <div class="profile-stat-card">
              <div class="profile-stat-big">${level}</div>
              <div class="profile-stat-label">LEVEL</div>
            </div>
            <div class="profile-stat-card">
              <div class="profile-stat-big">${profile.xp}</div>
              <div class="profile-stat-label">XP</div>
            </div>
            <div class="profile-stat-card">
              <div class="profile-stat-big">${profile.streak}</div>
              <div class="profile-stat-label">STREAK</div>
            </div>
            <div class="profile-stat-card">
              <div class="profile-stat-big">${completed}</div>
              <div class="profile-stat-label">MISSIONS</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    ` : `
    <section class="section">
      <div class="container">
        <div class="auth-inline-notice"><a href="#/login">Log in</a> to see your stats and appear on the leaderboard.</div>
      </div>
    </section>
    `}

    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Rankings</h2>
        ${leaderboard.length > 0 ? `
          <div class="leaderboard-table">
            <div class="leaderboard-row leaderboard-header-row">
              <span class="lb-rank">#</span>
              <span class="lb-name">Volunteer</span>
              <span class="lb-xp">XP</span>
              <span class="lb-actions">Actions</span>
            </div>
            ${leaderboard.map((v, i) => {
              const isYou = user && v.id === user.id;
              const name = usernameMap[v.id] || 'Anonymous';
              return `
                <div class="leaderboard-row ${isYou ? 'leaderboard-you' : ''}">
                  <span class="lb-rank">${getRankIcon(i)}</span>
                  <span class="lb-name">${name}${isYou ? ' <span style="font-size:0.7rem;color:var(--text-dim)">(you)</span>' : ''}</span>
                  <span class="lb-xp">${v.xp.toLocaleString()}</span>
                  <span class="lb-actions">${v.actions}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <p class="empty-state">No volunteers on the board yet. Claim a quest to take #1!</p>
        `}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title">Challenges</h2>
        <div class="challenges-grid">
          <div class="challenge-card">
            <div class="challenge-icon">&#128222;</div>
            <h3>Full Roster</h3>
            <p>Call all 20 Revenue Committee members</p>
            <span class="challenge-reward">500 XP total</span>
          </div>
          <div class="challenge-card">
            <div class="challenge-icon">&#127968;</div>
            <h3>Door Knocker</h3>
            <p>Visit 5 district offices in person</p>
            <span class="challenge-reward">1,000 XP total</span>
          </div>
          <div class="challenge-card">
            <div class="challenge-icon">&#128293;</div>
            <h3>Week Warrior</h3>
            <p>7-day activity streak</p>
            <span class="challenge-reward">Badge unlock</span>
          </div>
          <div class="challenge-card">
            <div class="challenge-icon">&#127897;</div>
            <h3>On The Record</h3>
            <p>Testify at a committee hearing</p>
            <span class="challenge-reward">500 XP</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function getRankIcon(index) {
  if (index === 0) return '<span style="font-size:1.1rem">&#129351;</span>';
  if (index === 1) return '<span style="font-size:1.1rem">&#129352;</span>';
  if (index === 2) return '<span style="font-size:1.1rem">&#129353;</span>';
  return index + 1;
}
