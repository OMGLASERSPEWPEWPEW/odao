import { addXP, getProfile, checkBadges } from '../lib/gamification.js';
import { getCompletedCount } from '../lib/missions.js';
import { logActivity, isLoggedIn, getUser, supabase } from '../lib/supabase.js';

const BOUNTY_STORAGE = 'repeal-data-claimed-bounties';
const SITE_BASE = 'https://sb3019.vercel.app';

function getClaimed() {
  try { return JSON.parse(localStorage.getItem(BOUNTY_STORAGE)) || []; }
  catch { return []; }
}

function claimBounty(id) {
  const claimed = getClaimed();
  if (!claimed.find(c => c.id === id)) {
    claimed.push({ id, claimedAt: new Date().toISOString() });
    localStorage.setItem(BOUNTY_STORAGE, JSON.stringify(claimed));
  }
}

function isClaimed(id) {
  return getClaimed().some(c => c.id === id);
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const label = btn.querySelector('.copy-link-label');
    if (label) { label.textContent = 'Copied!'; setTimeout(() => { label.textContent = 'Copy link'; }, 2000); }
  }).catch(() => prompt('Copy this link:', text));
}

function generateLegislatorBounties(legislators) {
  const bounties = [];
  legislators.forEach(leg => {
    const phone = leg.contact?.district;
    const address = leg.contact?.address;
    const email = leg.contact?.email;

    if (phone) {
      bounties.push({
        id: `leg-${leg.id}-call`, type: 'call',
        title: `Call Rep. ${leg.name}`,
        description: `District ${leg.district} (${leg.area || leg.role}). ${leg.leverage || ''}`,
        xp: 25, difficulty: 'easy', phone, legislator: leg.name,
        swayability: leg.swayability, repeatable: true,
      });
    }
    if (address) {
      bounties.push({
        id: `leg-${leg.id}-visit`, type: 'visit',
        title: `Visit Rep. ${leg.name}'s office`,
        description: `District ${leg.district} (${leg.area || leg.role}). ${leg.leverage || ''}`,
        xp: 200, difficulty: 'hard', address, legislator: leg.name,
        swayability: leg.swayability, repeatable: true,
      });
    }
    if (email) {
      bounties.push({
        id: `leg-${leg.id}-email`, type: 'email',
        title: `Email Rep. ${leg.name}`,
        description: `District ${leg.district} (${leg.area || leg.role}). ${leg.leverage || ''}`,
        xp: 20, difficulty: 'easy', email, legislator: leg.name,
        swayability: leg.swayability, repeatable: true,
      });
    }
  });
  return bounties;
}

function getTypeIcon(type) {
  switch (type) {
    case 'call': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>';
    case 'visit': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
    case 'social': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4l11.733 16h4.267l-11.733-16zM4 20l6.768-6.768M17.5 4l-6.768 6.768"/></svg>';
    case 'research': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>';
    case 'email': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';
    case 'recruit': return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>';
    default: return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/></svg>';
  }
}

function getDifficultyColor(d) {
  if (d === 'easy') return 'var(--green)';
  if (d === 'medium') return 'var(--gold)';
  return 'var(--red)';
}

function getSwayBadge(s) {
  if (!s) return '';
  const colors = { ally: 'var(--green)', high: 'var(--blue)', medium: 'var(--gold)', low: 'var(--text-dim)' };
  return `<span class="bounty-sway" style="color: ${colors[s] || 'var(--text-dim)'}">${s}</span>`;
}

export async function renderBounty() {
  const container = document.getElementById('page-bounty');
  const loggedIn = await isLoggedIn();

  const [specialRes, legRes] = await Promise.all([
    fetch('/bounties.json').then(r => r.json()).catch(() => []),
    fetch('/legislators.json').then(r => r.json()).catch(() => []),
  ]);

  const legBounties = generateLegislatorBounties(legRes);
  const allBounties = [...legBounties, ...specialRes];
  const types = [...new Set(allBounties.map(b => b.type))];

  // Fetch existing notes from Supabase
  let notesByQuest = {};
  try {
    const { data } = await supabase
      .from('campaign_activity')
      .select('data, created_at')
      .eq('type', 'bounty_claimed')
      .not('data->notes', 'is', null);
    if (data) {
      data.forEach(r => {
        const qid = r.data?.id;
        if (!qid || !r.data.notes) return;
        if (!notesByQuest[qid]) notesByQuest[qid] = [];
        notesByQuest[qid].push({
          notes: r.data.notes,
          claimedAt: r.created_at,
          bounty: r.data.bounty,
          volunteer: r.data.volunteer,
        });
      });
    }
  } catch { /* supabase unavailable */ }

  container.innerHTML = `
    <header class="page-header">
      <div class="container">
        <p class="page-eyebrow">ENGAGE</p>
        <h1 class="page-title">Quest Board</h1>
        <p class="page-subtitle">${allBounties.length} campaign tasks. Claim actions, earn XP, climb the leaderboard.</p>
      </div>
    </header>

    <section class="section">
      <div class="container">
        ${!loggedIn ? '<div class="auth-inline-notice"><a href="#/login">Log in</a> to claim quests and earn XP.</div>' : ''}

        <div class="bounty-filters">
          <button class="filter-pill active" data-filter="all">All (${allBounties.length})</button>
          ${types.map(t => {
            const count = allBounties.filter(b => b.type === t).length;
            return `<button class="filter-pill" data-filter="${t}">${t.charAt(0).toUpperCase() + t.slice(1)} (${count})</button>`;
          }).join('')}
          <button class="filter-pill" data-filter="unclaimed">Open</button>
        </div>

        <div class="bounty-grid" id="bountyGrid">
          ${allBounties.map(b => renderBountyCard(b, loggedIn, notesByQuest[b.id] || [])).join('')}
        </div>
      </div>
    </section>
  `;

  // Filters
  container.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      container.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.dataset.filter;
      container.querySelectorAll('.bounty-card').forEach(card => {
        if (filter === 'all') { card.style.display = ''; return; }
        if (filter === 'unclaimed') {
          card.style.display = card.classList.contains('claimed') ? 'none' : '';
          return;
        }
        card.style.display = card.dataset.type === filter ? '' : 'none';
      });
    });
  });

  // Claim buttons
  container.querySelectorAll('.bounty-claim-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!(await isLoggedIn())) {
        location.hash = '#/login';
        return;
      }

      const card = btn.closest('.bounty-card');
      const notesSection = card.querySelector('.quest-notes-section');

      if (notesSection && !notesSection.classList.contains('open')) {
        notesSection.classList.add('open');
        notesSection.style.display = 'block';
        btn.textContent = 'Save & Claim';
        return;
      }

      const id = btn.dataset.id;
      const xp = parseInt(btn.dataset.xp, 10);
      const title = btn.dataset.title;

      const textarea = card.querySelector('.quest-notes-input');
      const notes = textarea?.value?.trim() || null;
      const user = await getUser();

      claimBounty(id);
      const updated = addXP(xp);
      checkBadges(updated, getCompletedCount());
      logActivity('bounty_claimed', { id, xp, bounty: title, notes, volunteer: user?.username });

      card.classList.add('claimed');
      btn.innerHTML = `Claimed! +${xp} XP`;
      btn.disabled = true;
      if (notesSection) notesSection.style.display = 'none';

      // Show the saved note inline
      if (notes) {
        const notesDisplay = card.querySelector('.quest-notes-display');
        if (notesDisplay) {
          const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          notesDisplay.innerHTML += `<div class="quest-note-entry"><span class="quest-note-date">${date}</span><p class="quest-note-text">${notes.replace(/</g, '&lt;')}</p></div>`;
          notesDisplay.style.display = 'block';
        }
      }

      const shareArea = card.querySelector('.claim-share');
      if (shareArea) {
        const shareUrl = SITE_BASE + '/#/bounty';
        shareArea.innerHTML = `<button class="copy-link-btn" title="Copy link"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span class="copy-link-label">Copy link</span></button>`;
        shareArea.querySelector('.copy-link-btn').addEventListener('click', (e) => copyToClipboard(shareUrl, e.currentTarget));
      }
    });
  });
}

function renderBountyCard(b, loggedIn, notes) {
  const claimed = isClaimed(b.id);

  const notesHtml = notes.length > 0 ? `
    <div class="quest-notes-display" style="display:block">
      <span class="quest-notes-label">Notes (${notes.length})</span>
      ${notes.map(n => {
        const date = new Date(n.claimedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const who = n.volunteer ? `<span class="quest-note-author">${n.volunteer}</span>` : '';
        return `<div class="quest-note-entry">${who}<span class="quest-note-date">${date}</span><p class="quest-note-text">${n.notes.replace(/</g, '&lt;')}</p></div>`;
      }).join('')}
    </div>
  ` : '<div class="quest-notes-display" style="display:none"></div>';

  return `
    <div class="bounty-card ${claimed ? 'claimed' : ''}" data-type="${b.type}">
      <div class="bounty-card-header">
        <span class="bounty-type-icon" style="color: ${getDifficultyColor(b.difficulty)}">${getTypeIcon(b.type)}</span>
        <span class="bounty-type-label">${b.type.toUpperCase()}</span>
        ${getSwayBadge(b.swayability)}
        <span class="bounty-difficulty" style="color: ${getDifficultyColor(b.difficulty)}">${b.difficulty}</span>
      </div>
      <h3 class="bounty-title">${b.title}</h3>
      <p class="bounty-desc">${b.description}</p>
      ${b.phone ? `<div class="bounty-meta"><a href="tel:${b.phone}">${b.phone}</a></div>` : ''}
      ${b.email ? `<div class="bounty-meta"><a href="mailto:${b.email}">${b.email}</a></div>` : ''}
      ${b.address ? `<div class="bounty-meta">${b.address}</div>` : ''}
      ${notesHtml}
      <div class="bounty-footer">
        <span class="bounty-xp">${b.xp} XP</span>
        ${b.repeatable ? '<span class="bounty-repeatable">Repeatable</span>' : ''}
        <span class="claim-share"></span>
        <button class="bounty-claim-btn ${claimed ? 'claimed' : ''}" data-id="${b.id}" data-xp="${b.xp}" data-title="${b.title}" ${claimed ? 'disabled' : ''}>${claimed ? `Claimed! +${b.xp} XP` : (loggedIn ? 'Claim' : 'Log in to claim')}</button>
      </div>
      ${!claimed && loggedIn ? `
        <div class="quest-notes-section" style="display:none">
          <label class="quest-notes-label">Meeting / call notes</label>
          <textarea class="quest-notes-input" rows="4" placeholder="What happened? Key takeaways, next steps..."></textarea>
        </div>
      ` : ''}
    </div>
  `;
}
