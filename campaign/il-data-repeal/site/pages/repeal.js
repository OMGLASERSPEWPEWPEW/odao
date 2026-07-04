/* Repeal Page - full repeal campaign track with Game Room */

import { renderGameRoom } from '../lib/gameroom.js';

export async function renderRepeal() {
  const container = document.getElementById('page-repeal');
  if (!container) return;

  container.innerHTML = '';

  const gameroomSection = document.createElement('section');
  gameroomSection.className = 'section section-alt';
  const gameroomContainer = document.createElement('div');
  gameroomContainer.className = 'container';
  gameroomSection.appendChild(gameroomContainer);
  container.appendChild(gameroomSection);

  await renderGameRoom(gameroomContainer, {
    trackName: 'Repeal',
    trackColor: '#EF4444',
    trackSlug: 'repeal',
    headerClass: 'repeal-header',
    elevatorPitch: 'Illinois passed a 0.2% tax on every crypto transaction -- not on profits, on the total value, every time. No other state does this. No other asset class is taxed this way. We\'re supporting HB 5798 to repeal it before it takes effect January 1st.',
  });
}
