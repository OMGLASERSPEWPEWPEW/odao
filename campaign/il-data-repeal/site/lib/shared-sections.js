/* ============================================================
   Shared Sections — Calendar, Legislators, Act Now, Vote Math
   Rendered below the Game Room on every track page.
   ============================================================ */

import { generateAvatar } from '../app.js';
import { initLegislatorMap } from './legislator-map.js';

let cachedEvents = null;
let cachedLegislators = null;

// ---- Data Loaders (cached) ----

async function loadEvents() {
  if (cachedEvents) return cachedEvents;
  try {
    const res = await fetch('/events.json');
    cachedEvents = await res.json();
  } catch (e) {
    cachedEvents = [];
  }
  return cachedEvents;
}

async function loadLegislators() {
  if (cachedLegislators) return cachedLegislators;
  try {
    const res = await fetch('/legislators.json');
    cachedLegislators = await res.json();
  } catch (e) {
    cachedLegislators = [];
  }
  return cachedLegislators;
}


// ---- Public API ----

/**
 * Render the shared supporting sections (Calendar, Legislators, Act Now, Vote Math)
 * into the given container element.
 * @param {HTMLElement} container - The page container to append sections to
 */
export async function renderSharedSections(container) {
  const events = await loadEvents();
  const legislators = await loadLegislators();

  // Build the HTML
  const sectionsHTML = `
    ${renderBillStatusTracker()}
    ${renderActionPlan()}
    ${renderCalendar()}
    ${renderLegislatorsSection()}
    ${renderActNow()}
    ${renderVoteMath()}
  `;

  // Create a wrapper and append
  const wrapper = document.createElement('div');
  wrapper.className = 'shared-sections';
  wrapper.innerHTML = sectionsHTML;
  container.appendChild(wrapper);

  // Initialize interactivity
  initCalendarTimeline(wrapper, events);
  initLegislatorMap(wrapper, legislators);
  initLegislatorGrid(wrapper, legislators);
  initFilterButtons(wrapper, legislators);
  initCopyButtons(wrapper);
  initModal();
  initBillStatusTracker(wrapper);
}


// ---- Action Plan HTML ----

function renderActionPlan() {
  return `
    <section class="section" id="action-plan">
      <div class="container">
        <h2 class="section-title">Three-Prong Attack Plan</h2>
        <p class="section-subtitle">Simultaneous pressure from every angle. No single point of failure.</p>
        <div class="prongs-grid">

          <!-- Lobby Prong -->
          <div class="prong-column prong-lobby">
            <div class="prong-header">
              <div class="prong-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 7v1a3 3 0 003 3h0a3 3 0 003-3V7m0 0V4h6v3m0 0v1a3 3 0 003 3h0a3 3 0 003-3V7M6 21v-4m12 0v4"/></svg>
              </div>
              <h3>Lobby</h3>
            </div>
            <div class="prong-items">
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Legal Challenge</h4>
                  <p>Commerce Clause + ITFA preemption arguments</p>
                </div>
              </div>
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Governor Pressure</h4>
                  <p>Economic impact data showing job/business flight</p>
                </div>
              </div>
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Committee Work</h4>
                  <p>HB 5798 through Revenue Committee</p>
                </div>
              </div>
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Industry Coalition</h4>
                  <p>CCI, Coinbase, a16z aligned and funded</p>
                </div>
              </div>
              <div class="action-card" data-status="done">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Federal Leverage</h4>
                  <p>CFTC Chair Selig on record opposing</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Grassroots Prong -->
          <div class="prong-column prong-grassroots">
            <div class="prong-header">
              <div class="prong-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3>Grassroots</h3>
            </div>
            <div class="prong-items">
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Town Hall Testimony</h4>
                  <p>Personal stories from real people affected</p>
                </div>
              </div>
              <div class="action-card" data-status="not-started">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Media Campaign</h4>
                  <p>Chicago Tribune, Sun-Times, Block Club, local TV</p>
                </div>
              </div>
              <div class="action-card" data-status="not-started">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Letter/Call Campaigns</h4>
                  <p>Targeted at Revenue Committee members</p>
                </div>
              </div>
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Coalition Building</h4>
                  <p>OnionDAO attendees, restaurants, venues</p>
                </div>
              </div>
              <div class="action-card" data-status="not-started">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Stand With Crypto Scorecard</h4>
                  <p>Grade every IL legislator publicly</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Federal/Legal Prong -->
          <div class="prong-column prong-federal">
            <div class="prong-header">
              <div class="prong-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h3>Federal / Legal</h3>
            </div>
            <div class="prong-items">
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>CLARITY Act Preemption</h4>
                  <p>Federal legislation to override state crypto taxes</p>
                </div>
              </div>
              <div class="action-card" data-status="not-started">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>CFTC Formal Guidance</h4>
                  <p>Request official position on state transaction taxes</p>
                </div>
              </div>
              <div class="action-card" data-status="in-progress">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Constitutional Litigation</h4>
                  <p>Commerce Clause challenge in federal court</p>
                </div>
              </div>
              <div class="action-card" data-status="not-started">
                <div class="action-status"></div>
                <div class="action-content">
                  <h4>Injunction Before Jan 1</h4>
                  <p>Emergency relief to block enforcement</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `;
}


// ---- Calendar HTML ----

function renderCalendar() {
  return `
    <section class="section section-alt" id="calendar">
      <div class="container">
        <h2 class="section-title">Campaign Calendar</h2>
        <p class="section-subtitle">Every date matters. Plan around these windows.</p>
        <div class="timeline" id="timeline">
          <!-- Populated by JS -->
        </div>
      </div>
    </section>
  `;
}


// ---- Bill Status Tracker ----

const BILL_STATUS_URL = 'https://cencmfojarnapwinhdil.supabase.co/functions/v1/bill-status-check';

function renderBillStatusTracker() {
  return `
    <section class="section bill-status-section" id="billStatus">
      <div class="container">
        <div class="bill-status-tracker" id="billStatusTracker">
          <div class="bill-status-loading">Checking HB 5798 status...</div>
        </div>
      </div>
    </section>
  `;
}

function renderCheckLog(history) {
  if (!history || history.length < 2) return '';
  const rows = history.map(h => {
    const d = new Date(h.checked_at);
    const ts = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `<div class="check-log-row"><span class="check-log-ts">${ts}</span><span class="bill-status-badge bill-status-normal" style="font-size:0.6rem;padding:1px 6px;">${h.extracted_status}</span></div>`;
  }).join('');
  return `
    <button class="bill-status-sources-toggle" onclick="this.nextElementSibling.classList.toggle('open');this.classList.toggle('open')">
      <span class="arrow">&#9654;</span> Check log (${history.length} checks)
    </button>
    <div class="bill-status-sources-list">${rows}</div>
  `;
}

async function initBillStatusTracker(wrapper) {
  const tracker = wrapper.querySelector('#billStatusTracker');
  if (!tracker) return;

  try {
    const res = await fetch(BILL_STATUS_URL);
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();

    if (data.status === 'NO_DATA') {
      tracker.innerHTML = '<div class="bill-status-empty">No bill status checks recorded yet.</div>';
      return;
    }

    const status = data.extracted_status || 'UNKNOWN';
    const checkedAt = data.checked_at
      ? new Date(data.checked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
      : 'Unknown';
    const rawSummary = (data.summary || '').replace(/\*\*/g, '');
    const firstSentence = rawSummary.split(/(?<=[.!?])\s/)[0] || rawSummary;
    const isUrgent = status.includes('COMMITTEE') || status.includes('HEARING');
    const statusClass = isUrgent ? 'bill-status-urgent' : 'bill-status-normal';
    const actions = Array.isArray(data.actions) ? data.actions : [];

    const sourcesHtml = actions.length > 0 ? `
      <button class="bill-status-sources-toggle" onclick="this.nextElementSibling.classList.toggle('open');this.classList.toggle('open')">
        <span class="arrow">&#9654;</span> ${actions.length} ILGA actions on record
      </button>
      <div class="bill-status-sources-list">
        ${actions.map(a => `<div class="bill-action-row"><span class="bill-action-date">${a.date}</span> ${a.action}</div>`).join('')}
      </div>
    ` : '';

    tracker.innerHTML = `
      <div class="tracker-radar"><span class="radar-ping"></span><span class="radar-dot"></span></div>
      <div class="tracker-title">Ann Marie's Super Duper<br/><span class="tracker-title-highlight">"Assigned to Committee"</span> Tracker</div>
      <div class="tracker-status-row">
        <span class="tracker-status-badge ${statusClass}">${status}</span>
        <span class="tracker-bill-id">HB 5798</span>
      </div>
      <div class="bill-status-summary">${firstSentence}</div>
      <div class="tracker-method-bar">
        <span class="tracker-method-step"><span class="tracker-method-icon">1</span> Scraped <a href="${data.ilga_url || 'https://ilga.gov'}" target="_blank" rel="noopener">ilga.gov</a></span>
        <span class="tracker-method-arrow">&rarr;</span>
        <span class="tracker-method-step"><span class="tracker-method-icon">2</span> Claude Haiku</span>
        <span class="tracker-method-arrow">&rarr;</span>
        <span class="tracker-method-step"><span class="tracker-method-icon">3</span> Result</span>
      </div>
      <div class="tracker-checked">Last checked: ${checkedAt}</div>
      ${sourcesHtml}
      ${renderCheckLog(data.history || [])}
    `;
  } catch {
    tracker.innerHTML = '<div class="bill-status-empty">Bill status tracker unavailable.</div>';
  }
}


// ---- Legislators HTML ----

function renderLegislatorsSection() {
  return `
    <section class="section" id="legislators">
      <div class="container">
        <h2 class="section-title">People to Sway</h2>
        <p class="section-subtitle">Revenue Committee members who hold the fate of HB 5798.</p>

        <!-- Interactive Map -->
        <div id="legislatorsMap" class="legislators-map" role="region" aria-label="Interactive map of Illinois legislators"></div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Party</label>
            <div class="filter-buttons" id="partyFilter">
              <button class="filter-btn active" data-value="all">All</button>
              <button class="filter-btn" data-value="D">Democrat</button>
              <button class="filter-btn" data-value="R">Republican</button>
            </div>
          </div>
          <div class="filter-group">
            <label>Swayability</label>
            <div class="filter-buttons" id="swayFilter">
              <button class="filter-btn active" data-value="all">All</button>
              <button class="filter-btn" data-value="high">High</button>
              <button class="filter-btn" data-value="medium">Medium</button>
              <button class="filter-btn" data-value="low">Low</button>
              <button class="filter-btn" data-value="ally">Ally</button>
            </div>
          </div>
        </div>

        <div class="legislators-grid" id="legislatorsGrid">
          <!-- Populated by JS -->
        </div>
      </div>
    </section>
  `;
}


// ---- Act Now HTML ----

function renderActNow() {
  return `
    <section class="section section-alt" id="actions">
      <div class="container">
        <h2 class="section-title">What You Can Do RIGHT NOW</h2>
        <p class="section-subtitle">Town hall season is here. Every call, letter, and conversation counts.</p>

        <div class="action-grid">

          <div class="now-card">
            <div class="now-number">1</div>
            <h3>Find Your Legislator's Town Hall</h3>
            <ul>
              <li>Visit <a href="https://ilga.gov" target="_blank" rel="noopener">ilga.gov</a> and search for your district</li>
              <li>Call district office: "When is the next town hall?"</li>
              <li>Sign up for their email newsletter</li>
              <li>Follow <a href="https://twitter.com/ILSenDems" target="_blank" rel="noopener">@ILSenDems</a>, <a href="https://twitter.com/ILHouseGOP" target="_blank" rel="noopener">@ILHouseGOP</a> on social media</li>
            </ul>
          </div>

          <div class="now-card">
            <div class="now-number">2</div>
            <h3>Call Your Representative</h3>
            <div class="script-block">
              <p class="script-label">SCRIPT:</p>
              <p>"Hi, my name is <strong>[NAME]</strong> from <strong>[CITY]</strong>. I'm calling about the Digital Asset Tax in SB 3019. I'm asking Representative <strong>[NAME]</strong> to support HB 5798, which would repeal this tax. <strong>[PERSONAL REASON]</strong>. Can you tell me the Representative's position on this issue?"</p>
            </div>
          </div>

          <div class="now-card">
            <div class="now-number">3</div>
            <h3>Write a Letter</h3>
            <p>Key points to include:</p>
            <ul>
              <li>Your name and address (proves you're a constituent)</li>
              <li>How crypto/blockchain affects your life</li>
              <li>The OnionDAO story &mdash; 400+ people, free workshops, community</li>
              <li>The ask: support HB 5798 to repeal</li>
            </ul>
          </div>

          <div class="now-card">
            <div class="now-number">4</div>
            <h3>Share on Social Media</h3>
            <div class="script-block">
              <p class="script-label">SAMPLE POST:</p>
              <p>"Illinois just passed the most punitive crypto tax in the US &mdash; 0.2% on EVERY transaction, not just profits. This threatens events like @oniondao_ that bring 400+ people to Chicago for free workshops, learning, and community. Support HB 5798 to repeal. #RepealDATA #SaveOnionDAO"</p>
            </div>
            <button class="copy-btn" data-copy="Illinois just passed the most punitive crypto tax in the US — 0.2% on EVERY transaction, not just profits. This threatens events like @oniondao_ that bring 400+ people to Chicago for free workshops, learning, and community. Support HB 5798 to repeal. #RepealDATA #SaveOnionDAO">Copy to clipboard</button>
          </div>

          <div class="now-card">
            <div class="now-number">5</div>
            <h3>Join the Coalition</h3>
            <ul>
              <li>Illinois Blockchain Association</li>
              <li><a href="https://standwithcrypto.org" target="_blank" rel="noopener">Stand With Crypto</a></li>
              <li>OnionDAO community channels</li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  `;
}


// ---- Vote Math HTML ----

function renderVoteMath() {
  return `
    <section class="section" id="vote-math">
      <div class="container">
        <h2 class="section-title">Vote Math</h2>
        <p class="section-subtitle">60 votes needed to pass HB 5798 in the Illinois House.</p>

        <div class="vote-math-visual">
          <div class="vote-bar-container">
            <div class="vote-bar">
              <div class="vote-segment vote-locked" style="width: 33.9%">
                <span class="vote-segment-label">40 R</span>
              </div>
              <div class="vote-segment vote-targets" style="width: 16.95%">
                <span class="vote-segment-label">20 needed</span>
              </div>
              <div class="vote-segment vote-remainder" style="width: 49.15%">
                <span class="vote-segment-label">58 other D</span>
              </div>
            </div>
            <div class="vote-threshold">
              <div class="vote-threshold-line" style="left: 50.85%"></div>
              <div class="vote-threshold-label" style="left: 50.85%">60 votes needed</div>
            </div>
          </div>

          <div class="vote-legend">
            <div class="legend-item">
              <span class="legend-dot legend-locked"></span>
              <span>40 Republicans &mdash; locked YES</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot legend-targets"></span>
              <span>20 Democrats needed &mdash; primary targets</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot legend-remainder"></span>
              <span>58 remaining Democrats</span>
            </div>
          </div>

          <div class="vote-summary">
            <div class="vote-stat">
              <span class="vote-stat-number">118</span>
              <span class="vote-stat-label">Total House seats</span>
            </div>
            <div class="vote-stat">
              <span class="vote-stat-number vote-green">40</span>
              <span class="vote-stat-label">Locked YES (all R)</span>
            </div>
            <div class="vote-stat">
              <span class="vote-stat-number vote-gold">20</span>
              <span class="vote-stat-label">Dems needed to flip</span>
            </div>
            <div class="vote-stat">
              <span class="vote-stat-number vote-red">60</span>
              <span class="vote-stat-label">Votes to pass</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}


// ---- Calendar Initialization ----

function initCalendarTimeline(wrapper, events) {
  const timeline = wrapper.querySelector('#timeline');
  if (!timeline || events.length === 0) return;

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
      <div class="timeline-card">
        <div class="timeline-date"><span class="timeline-dot"></span>${dateStr}</div>
        <div class="timeline-title">${event.title}</div>
        ${badge}
      </div>
    `;

    item.addEventListener('click', () => openEventModal(event));
    timeline.appendChild(item);
  });
}


// ---- Legislator Grid Initialization ----

let currentPartyFilter = 'all';
let currentSwayFilter = 'all';

function initLegislatorGrid(wrapper, legislators) {
  currentPartyFilter = 'all';
  currentSwayFilter = 'all';
  renderLegislatorCards(wrapper, legislators);
}

function renderLegislatorCards(wrapper, legislators) {
  const grid = wrapper.querySelector('#legislatorsGrid');
  if (!grid) return;

  const filtered = legislators.filter(leg => {
    if (currentPartyFilter !== 'all' && leg.party !== currentPartyFilter) return false;
    if (currentSwayFilter !== 'all' && leg.swayability !== currentSwayFilter) return false;
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--text-dim);grid-column:1/-1;padding:40px 0;">No legislators match the current filters.</p>';
    return;
  }

  grid.innerHTML = filtered.map(leg => buildLegislatorCardHTML(leg)).join('');
}

export function buildLegislatorCardHTML(leg, { expanded = false } = {}) {
  const partyClass = leg.party === 'D' ? 'dem' : 'rep';
  const partyLabel = leg.party === 'D' ? 'DEM' : 'GOP';
  const swayClass = `sway-${leg.swayability}`;
  const swayLabel = leg.swayability === 'ally' ? 'ALLY' : leg.swayability.toUpperCase();
  const area = leg.chicago ? 'Chicago' + (leg.area ? ` (${leg.area})` : '') : (leg.area || '');

  const photoSlug = leg.name.toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, '-');
  const avatarFallback = generateAvatar(leg.name, leg.party);

  const priorityBadge = leg.priority === 'critical' ? '<span class="priority-badge critical">PRIORITY</span>' :
                        leg.priority === 'coordinate' ? '<span class="priority-badge coordinate">COORDINATE</span>' : '';

  const openClass = expanded ? ' open' : '';
  const contactHtml = leg.contact ? `
    <button class="legislator-expand${openClass}" onclick="toggleContact(this)">
      <span class="arrow">&#9654;</span> Contact Info & Office Address
    </button>
    <div class="legislator-contact${openClass}">
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
}


// ---- Filter Buttons ----

function initFilterButtons(wrapper, legislators) {
  const partyFilter = wrapper.querySelector('#partyFilter');
  const swayFilter = wrapper.querySelector('#swayFilter');

  if (partyFilter) {
    partyFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      partyFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPartyFilter = btn.dataset.value;
      renderLegislatorCards(wrapper, legislators);
    });
  }

  if (swayFilter) {
    swayFilter.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      swayFilter.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSwayFilter = btn.dataset.value;
      renderLegislatorCards(wrapper, legislators);
    });
  }
}


// ---- Copy Buttons ----

function initCopyButtons(wrapper) {
  wrapper.querySelectorAll('.copy-btn').forEach(btn => {
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


// ---- Event Modal ----

let modalInitialized = false;

function initModal() {
  if (modalInitialized) return;

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

  modalInitialized = true;
}

function openEventModal(event) {
  const overlay = document.getElementById('eventModal');
  const badge = document.getElementById('modalBadge');
  const title = document.getElementById('modalTitle');
  const date = document.getElementById('modalDate');
  const desc = document.getElementById('modalDesc');
  const actionList = document.getElementById('modalActionList');

  if (!overlay) return;

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


// ---- Utility ----

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
