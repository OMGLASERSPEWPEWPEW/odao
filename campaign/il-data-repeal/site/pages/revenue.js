/* ============================================================
   Revenue Track — Tax Revenue Engine game room
   ============================================================ */

import { renderGameRoom } from '../lib/gameroom.js';

export async function renderRevenue() {
  const container = document.getElementById('page-revenue');
  if (!container) return;

  container.innerHTML = '';

  const gameroomSection = document.createElement('section');
  gameroomSection.className = 'section section-alt';
  const gameroomContainer = document.createElement('div');
  gameroomContainer.className = 'container';
  gameroomSection.appendChild(gameroomContainer);
  container.appendChild(gameroomSection);

  await renderGameRoom(gameroomContainer, {
    trackName: 'Tax Revenue Engine',
    trackColor: '#FFD700',
    trackSlug: 'revenue',
    headerClass: 'revenue-header',
    elevatorPitch: 'OnionDAO already generates more tax revenue for Chicago than this crypto tax would collect from community DAOs. Thirty days of catered meals, restaurant buyouts, hotel stays — all taxed at Chicago\'s rates. The city is spending $40 million a year to attract events like this. The state is taxing away the reason they come.',
  });
}
