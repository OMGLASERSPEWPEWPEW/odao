/* ============================================================
   Briefing Page — daily campaign briefings with TTS
   ============================================================ */

import { speak, stopSpeaking, isSpeaking } from '../lib/tts.js';

let briefingsCache = null;

async function loadBriefings() {
  if (briefingsCache) return briefingsCache;
  try {
    const res = await fetch('/briefings.json');
    briefingsCache = await res.json();
    return briefingsCache;
  } catch (err) {
    console.error('Failed to load briefings:', err);
    return [];
  }
}

export async function renderBriefing() {
  const container = document.getElementById('page-briefing');
  const briefings = await loadBriefings();

  if (briefings.length === 0) {
    container.innerHTML = `
      <div class="container" style="padding:80px 20px;text-align:center;">
        <p style="color:var(--text-dim)">No briefings available yet. Check back soon.</p>
      </div>
    `;
    return;
  }

  // Campaign start date for day counter
  const campaignStart = new Date('2026-07-03T00:00:00');
  const today = new Date();
  const dayNumber = Math.max(1, Math.floor((today - campaignStart) / (1000 * 60 * 60 * 24)) + 1);

  // Find today's or latest briefing
  const todayStr = today.toISOString().slice(0, 10);
  let currentBriefing = briefings.find(b => b.date === todayStr);
  if (!currentBriefing) {
    // Get the most recent past briefing
    const pastBriefings = briefings
      .filter(b => b.date <= todayStr)
      .sort((a, b) => b.date.localeCompare(a.date));
    currentBriefing = pastBriefings[0] || briefings[briefings.length - 1];
  }

  const pastBriefings = briefings
    .filter(b => b.date !== currentBriefing.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  const typeColors = {
    update: { bg: 'rgba(59,130,246,0.15)', color: '#3B82F6' },
    mission: { bg: 'rgba(255,215,0,0.15)', color: '#FFD700' },
    tip: { bg: 'rgba(34,197,94,0.15)', color: '#22C55E' },
    motivation: { bg: 'rgba(168,85,247,0.15)', color: '#A855F7' },
  };

  container.innerHTML = `
    <header class="page-header briefing-header">
      <div class="container">
        <p class="page-eyebrow">DAILY BRIEFING</p>
        <h1 class="page-title">Day ${currentBriefing.dayNumber || dayNumber} of the Campaign</h1>
        <p class="page-subtitle">${formatBriefingDate(currentBriefing.date)}</p>
        ${currentBriefing.greeting ? `<p class="briefing-greeting">${currentBriefing.greeting}</p>` : ''}
        <button class="briefing-listen-btn" id="briefingListenBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.08"/>
          </svg>
          Listen to Briefing
        </button>
      </div>
    </header>

    <section class="section">
      <div class="container">
        <div class="briefing-cards" id="briefingCards">
          ${currentBriefing.sections.map((section, i) => {
            const typeStyle = typeColors[section.type] || typeColors.update;
            return `
              <div class="briefing-card" style="animation-delay: ${i * 500}ms">
                <div class="briefing-type-badge" style="background:${typeStyle.bg};color:${typeStyle.color}">
                  ${section.type.toUpperCase()}
                </div>
                <p class="briefing-card-text">${section.text}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>

    ${pastBriefings.length > 0 ? `
    <section class="section section-alt">
      <div class="container">
        <h2 class="section-title">Past Briefings</h2>
        <div class="past-briefings" id="pastBriefings">
          ${pastBriefings.map(b => `
            <div class="past-briefing-item" data-date="${b.date}">
              <button class="past-briefing-toggle">
                <span class="past-briefing-date">${formatBriefingDate(b.date)}</span>
                <span class="past-briefing-title">Day ${b.dayNumber || '?'} &mdash; ${b.greeting || 'Daily Briefing'}</span>
                <span class="past-briefing-arrow">&#9654;</span>
              </button>
              <div class="past-briefing-content">
                ${b.sections.map(s => {
                  const ts = typeColors[s.type] || typeColors.update;
                  return `
                    <div class="past-briefing-card">
                      <span class="briefing-type-badge-sm" style="background:${ts.bg};color:${ts.color}">${s.type.toUpperCase()}</span>
                      <p>${s.text}</p>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    ` : ''}
  `;

  // TTS button
  const listenBtn = document.getElementById('briefingListenBtn');
  listenBtn.addEventListener('click', () => {
    if (isSpeaking()) {
      stopSpeaking();
      listenBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.08"/>
        </svg>
        Listen to Briefing
      `;
      return;
    }

    const texts = currentBriefing.sections.map(s => s.text);
    texts.forEach(text => speak(text));

    listenBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
        <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
      </svg>
      Stop Listening
    `;
  });

  // Past briefing toggles
  container.querySelectorAll('.past-briefing-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.past-briefing-item');
      item.classList.toggle('expanded');
    });
  });
}

function formatBriefingDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
