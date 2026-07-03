/* ============================================================
   SB 3019 Campaign War Room — v3
   ============================================================ */

import { initRouter } from './lib/router.js';
import { updateStreak } from './lib/gamification.js';
import { renderLanding } from './pages/landing.js';
import { renderRepeal } from './pages/repeal.js';
import { renderCarveout } from './pages/carveout.js';
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

function initNavCountdown() {
  const el = document.getElementById('nav-countdown');
  if (el) el.textContent = `${getDaysRemaining()}d`;
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


// ---- Calendar Timeline ----
let calendarRendered = false;

async function initCalendar() {
  if (calendarRendered) return;
  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  let events;
  try {
    const res = await fetch('/events.json');
    events = await res.json();
  } catch (err) {
    timeline.innerHTML = '<p style="color:var(--red)">Failed to load events.</p>';
    return;
  }

  timeline.innerHTML = '';
  events.forEach(event => {
    const isPast = event.past;
    const isUrgent = event.urgent;

    let prongClass = 'prong-lobby';
    if (event.prong === 'grassroots') prongClass = 'prong-grassroots';
    else if (event.prong === 'federal') prongClass = 'prong-federal';
    else if (event.prong === 'deadline') prongClass = 'prong-deadline';

    let dateStr = formatDate(event.date);
    if (event.endDate) {
      dateStr += ' - ' + formatDate(event.endDate);
    }

    let badge = '';
    if (isPast) {
      badge = '<span class="timeline-badge badge-past">COMPLETED</span>';
    } else if (isUrgent) {
      badge = '<span class="timeline-badge badge-urgent">CRITICAL</span>';
    } else {
      badge = '<span class="timeline-badge badge-now">UPCOMING</span>';
    }

    const item = document.createElement('div');
    item.className = `timeline-item ${prongClass}${isPast ? ' is-past' : ''}${isUrgent ? ' is-urgent' : ''}`;
    item.dataset.eventId = event.id;

    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-date">${dateStr}</div>
        <div class="timeline-title">${event.title}</div>
        <div class="timeline-desc">${event.description}</div>
        ${badge}
        <div class="timeline-click-hint">Click for action items</div>
      </div>
    `;

    item.addEventListener('click', () => openEventModal(event));
    timeline.appendChild(item);
  });

  calendarRendered = true;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}


// ---- Event Modal ----
function initModal() {
  const overlay = document.getElementById('eventModal');
  const closeBtn = document.getElementById('modalClose');
  if (!overlay || !closeBtn) return;

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openEventModal(event) {
  const overlay = document.getElementById('eventModal');
  const badge = document.getElementById('modalBadge');
  const title = document.getElementById('modalTitle');
  const date = document.getElementById('modalDate');
  const desc = document.getElementById('modalDesc');
  const actionList = document.getElementById('modalActionList');

  const prongColors = {
    lobby: { bg: 'rgba(255,215,0,0.2)', color: '#FFD700', label: 'LOBBY' },
    grassroots: { bg: 'rgba(34,197,94,0.2)', color: '#22C55E', label: 'GRASSROOTS' },
    federal: { bg: 'rgba(59,130,246,0.2)', color: '#3B82F6', label: 'FEDERAL' },
    deadline: { bg: 'rgba(239,68,68,0.2)', color: '#EF4444', label: 'DEADLINE' },
  };
  const prong = prongColors[event.prong] || prongColors.lobby;
  badge.textContent = prong.label;
  badge.style.background = prong.bg;
  badge.style.color = prong.color;

  title.textContent = event.title;
  title.style.color = prong.color;

  let dateStr = formatDate(event.date);
  if (event.endDate) dateStr += ' - ' + formatDate(event.endDate);
  date.textContent = dateStr;

  desc.textContent = event.description;

  actionList.innerHTML = '';
  (event.actions || []).forEach(action => {
    const li = document.createElement('li');
    li.textContent = action;
    li.style.borderLeftColor = prong.color;
    actionList.appendChild(li);
  });

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = document.getElementById('eventModal');
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}


// ---- Legislator Grid ----
let allLegislators = [];
let currentPartyFilter = 'all';
let currentSwayFilter = 'all';
let legislatorsRendered = false;

async function initLegislators() {
  if (legislatorsRendered) return;
  const grid = document.getElementById('legislatorsGrid');
  if (!grid) return;

  try {
    const res = await fetch('/legislators.json');
    allLegislators = await res.json();
  } catch (err) {
    grid.innerHTML = '<p style="color:var(--red)">Failed to load legislator data.</p>';
    return;
  }

  renderLegislators();
  initFilters();
  legislatorsRendered = true;
}

function generateAvatar(name, party) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
  const bg = party === 'D' ? '#3B82F6' : '#EF4444';
  return `<svg width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="24" fill="${bg}"/><text x="24" y="24" text-anchor="middle" dy=".35em" fill="white" font-size="16" font-weight="600">${initials}</text></svg>`;
}

// Make avatar generator available globally for onerror fallbacks
window.generateAvatar = generateAvatar;

function renderLegislators() {
  const grid = document.getElementById('legislatorsGrid');
  const filtered = allLegislators.filter(leg => {
    if (currentPartyFilter !== 'all' && leg.party !== currentPartyFilter) return false;
    if (currentSwayFilter !== 'all' && leg.swayability !== currentSwayFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-dim);grid-column:1/-1;padding:40px 0;">No legislators match the current filters.</p>';
    return;
  }

  grid.innerHTML = filtered.map(leg => {
    const partyClass = leg.party === 'D' ? 'dem' : 'rep';
    const partyLabel = leg.party === 'D' ? 'DEM' : 'GOP';
    const swayClass = `sway-${leg.swayability}`;
    const swayLabel = leg.swayability === 'ally' ? 'ALLY' : leg.swayability.toUpperCase();
    const area = leg.chicago ? 'Chicago' + (leg.area ? ` (${leg.area})` : '') : (leg.area || '');

    // Generate photo slug from name
    const photoSlug = leg.name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '-');
    const avatarFallback = generateAvatar(leg.name, leg.party);

    const priorityBadge = leg.priority === 'critical' ? '<span class="priority-badge critical">PRIORITY</span>' :
                          leg.priority === 'coordinate' ? '<span class="priority-badge coordinate">COORDINATE</span>' : '';

    const contactHtml = leg.contact ? `
      <button class="legislator-expand" onclick="toggleContact(this)">
        <span class="arrow">&#9654;</span> Contact Info & Office Address
      </button>
      <div class="legislator-contact">
        ${leg.contact.address ? `<div class="contact-row address-row"><span>District Office:</span><a href="https://maps.google.com/?q=${encodeURIComponent(leg.contact.address)}" target="_blank" rel="noopener">${leg.contact.address}</a></div>` : ''}
        ${leg.contact.district ? `<div class="contact-row"><span>District Phone:</span><a href="tel:${leg.contact.district}">${leg.contact.district}</a></div>` : ''}
        ${leg.contact.springfield ? `<div class="contact-row"><span>Springfield:</span><a href="tel:${leg.contact.springfield}">${leg.contact.springfield}</a></div>` : ''}
        ${leg.contact.email ? `<div class="contact-row"><span>Email:</span><a href="mailto:${leg.contact.email}">${leg.contact.email}</a></div>` : ''}
      </div>
    ` : '';

    return `
      <div class="legislator-card">
        <div class="legislator-top">
          <div class="legislator-top-left">
            <div class="legislator-avatar">
              <img src="/photos/legislators/${photoSlug}.jpg" width="48" height="48" alt="${leg.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
              <span class="avatar-fallback" style="display:none">${avatarFallback}</span>
            </div>
            <div>
              <div class="legislator-name">${leg.name}</div>
              <div class="legislator-meta">
                <span class="party-badge ${partyClass}">${partyLabel}</span>
                ${leg.role !== 'Member' ? `<span class="role-badge">${leg.role}</span>` : ''}
                ${leg.chicago ? '<span class="chicago-badge">Chicago</span>' : ''}
                ${priorityBadge}
              </div>
            </div>
          </div>
          <div class="district-label">D-${leg.district}</div>
        </div>
        ${area ? `<div style="font-size:0.8rem;color:var(--text-dim);margin-bottom:8px;">${area}</div>` : ''}
        <div class="sway-meter">
          <div class="sway-label">
            <span>Swayability</span>
            <span class="sway-value ${swayClass}">${swayLabel}</span>
          </div>
          <div class="sway-bar-track">
            <div class="sway-bar-fill ${swayClass}"></div>
          </div>
        </div>
        <div class="legislator-leverage">${leg.leverage}</div>
        ${contactHtml}
      </div>
    `;
  }).join('');
}

function initFilters() {
  document.getElementById('partyFilter').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#partyFilter .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPartyFilter = btn.dataset.value;
    renderLegislators();
  });

  document.getElementById('swayFilter').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('#swayFilter .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSwayFilter = btn.dataset.value;
    renderLegislators();
  });
}

// Global function for inline onclick
window.toggleContact = function(btn) {
  const contact = btn.nextElementSibling;
  btn.classList.toggle('open');
  contact.classList.toggle('open');
};


// ---- Copy to Clipboard ----
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy to clipboard';
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy to clipboard';
          btn.classList.remove('copied');
        }, 2000);
      }
    });
  });
}


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
      onEnter: () => {
        initCalendar();
        initModal();
        initLegislators();
        initCopyButtons();
        renderRepeal();
      }
    },
    '/carveout': {
      id: 'page-carveout',
      onEnter: () => renderCarveout()
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
