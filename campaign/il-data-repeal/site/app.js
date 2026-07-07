/* ============================================================
   SB 3019 Campaign War Room — v0.1
   ============================================================ */

import { initRouter } from './lib/router.js';
import { updateStreak } from './lib/gamification.js';
import { getUser, logout } from './lib/supabase.js';
import { renderLanding } from './pages/landing.js';
import { renderRepeal } from './pages/repeal.js';
import { renderBounty } from './pages/bounty.js';
import { renderActivity } from './pages/activity.js';
import { renderLeaderboard } from './pages/leaderboard.js';
import { renderIdeas } from './pages/ideas.js';
import { renderSharedDocs } from './pages/shared-docs.js';
import { renderLogin } from './pages/login.js';
import { registerSW } from 'virtual:pwa-register';
import { CHANGELOG } from './data/changelog.js';

export const DEADLINE = new Date('2027-01-01T00:00:00-06:00');
export const CAMPAIGN_START = new Date('2026-07-03T00:00:00-06:00');

export function getDaysRemaining() {
  const diff = DEADLINE - new Date();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getCampaignDay() {
  const diff = new Date() - CAMPAIGN_START;
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

export function generateAvatar(name, party) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const bg = party === 'D' ? '#3B82F6' : '#EF4444';
  return `<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${bg}"/><text x="24" y="24" text-anchor="middle" dy=".35em" fill="white" font-size="16" font-weight="600">${initials}</text></svg>`;
}

window.generateAvatar = generateAvatar;


// ---- Auth-aware nav ----
async function initAuthNav() {
  const authNav = document.getElementById('navAuthItem');
  if (!authNav) return;

  const user = await getUser();
  if (user) {
    authNav.innerHTML = `
      <span class="nav-user-name">${user.username}</span>
      <button class="nav-logout-btn" id="navLogoutBtn">Log out</button>
    `;
    document.getElementById('navLogoutBtn')?.addEventListener('click', async () => {
      await logout();
      location.reload();
    });
  } else {
    authNav.innerHTML = `<a href="#/login" class="nav-login-link">Log in</a>`;
  }
}


// ---- Version Stamp ----
const SEEN_KEY = 'repeal-changelog-seen';

function initVersionStamp() {
  const btn = document.getElementById('versionStampBtn');
  const text = document.getElementById('versionStampText');
  const star = document.getElementById('versionStar');
  const dropdown = document.getElementById('versionDropdown');
  const entries = document.getElementById('versionDropdownEntries');
  const count = document.getElementById('versionDropdownCount');
  const wrapper = document.getElementById('versionStampWrapper');

  if (!btn) return;

  const version = `v${__APP_VERSION__}`;
  text.textContent = version;

  const latest = CHANGELOG[0]?.version;
  const seen = localStorage.getItem(SEEN_KEY) || '';
  const unread = !!latest && seen !== latest;

  if (unread) {
    star.style.display = '';
    text.classList.add('version-unread');
  }

  const showing = CHANGELOG.slice(0, 3);
  count.textContent = `latest ${showing.length}`;
  entries.innerHTML = showing.map((note, i) => `
    <div class="version-entry">
      <div class="version-entry-header">
        <span class="version-entry-version">v${note.version}</span>
        <span class="version-entry-date">${note.date}</span>
        ${i === 0 ? '<span class="version-entry-latest">latest</span>' : ''}
      </div>
      <p class="version-entry-title">${note.title}</p>
      <p class="version-entry-summary">${note.summary}</p>
      ${note.details ? `
        <ul class="version-entry-details">
          ${note.details.map(d => `<li><span class="version-detail-dot">&middot;</span> ${d}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `).join('');

  let open = false;
  btn.addEventListener('click', () => {
    open = !open;
    dropdown.style.display = open ? 'block' : 'none';
    if (open && unread) {
      localStorage.setItem(SEEN_KEY, latest);
      star.style.display = 'none';
      text.classList.remove('version-unread');
    }
  });

  document.addEventListener('mousedown', (e) => {
    if (open && wrapper && !wrapper.contains(e.target)) {
      open = false;
      dropdown.style.display = 'none';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (open && e.key === 'Escape') {
      open = false;
      dropdown.style.display = 'none';
    }
  });
}


// ---- Nav Countdown ----
function initNavCountdown() {
  const el = document.getElementById('nav-countdown');
  if (el) el.textContent = `${getDaysRemaining()}d`;
}


// ---- Mobile Nav Toggle + Dropdown Groups ----
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      links.querySelectorAll('.nav-dropdown').forEach(dd => dd.classList.remove('open'));
    });
  });

  links.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = trigger.closest('.nav-group');
      const dd = group.querySelector('.nav-dropdown');
      const isOpen = dd.classList.contains('open');

      links.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
      if (!isOpen) dd.classList.add('open');
    });
  });
}


// ---- Service Worker (auto-update, no prompt) ----
registerSW();


// Global function for inline onclick (used by legislator cards)
window.toggleContact = function(btn) {
  const contact = btn.nextElementSibling;
  btn.classList.toggle('open');
  contact.classList.toggle('open');
};


// ---- Router & Init ----
document.addEventListener('DOMContentLoaded', () => {
  updateStreak();
  initNav();
  initNavCountdown();
  initVersionStamp();
  initAuthNav();

  initRouter({
    '/': { id: 'page-landing', onEnter: () => renderLanding() },
    '/repeal': { id: 'page-repeal', onEnter: () => renderRepeal() },
    '/bounty': { id: 'page-bounty', onEnter: () => renderBounty() },
    '/activity': { id: 'page-activity', onEnter: () => renderActivity() },
    '/leaderboard': { id: 'page-leaderboard', onEnter: () => renderLeaderboard() },
    '/ideas': { id: 'page-ideas', onEnter: () => renderIdeas() },
    '/shared-docs': { id: 'page-shared-docs', onEnter: () => renderSharedDocs() },
    '/login': { id: 'page-login', onEnter: () => renderLogin() },
  });
});
