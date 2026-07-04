/* ============================================================
   SB 3019 Campaign War Room — v3
   ============================================================ */

import { initRouter } from './lib/router.js';
import { updateStreak } from './lib/gamification.js';
import { renderLanding } from './pages/landing.js';
import { renderRepeal } from './pages/repeal.js';
import { renderCarveout } from './pages/carveout.js';
import { renderRevenue } from './pages/revenue.js';
import { renderBriefing } from './pages/briefing.js';
import { renderProfile } from './pages/profile.js';

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

// Make avatar generator available globally for onerror fallbacks
window.generateAvatar = generateAvatar;

function initNavCountdown() {
  const el = document.getElementById('nav-countdown');
  if (el) el.textContent = `${getDaysRemaining()}d`;
  const versionEl = document.getElementById('version-stamp');
  if (versionEl) versionEl.textContent = `v${__APP_VERSION__}`;
}


// ---- Mobile Nav Toggle ----
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });

  // Close nav on link click (mobile)
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
    });
  });
}


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

  initRouter({
    '/': {
      id: 'page-landing',
      onEnter: () => renderLanding()
    },
    '/repeal': {
      id: 'page-repeal',
      onEnter: () => renderRepeal()
    },
    '/carveout': {
      id: 'page-carveout',
      onEnter: () => renderCarveout()
    },
    '/revenue': {
      id: 'page-revenue',
      onEnter: () => renderRevenue()
    },
    '/briefing': {
      id: 'page-briefing',
      onEnter: () => renderBriefing()
    },
    '/profile': {
      id: 'page-profile',
      onEnter: () => renderProfile()
    }
  });
});
