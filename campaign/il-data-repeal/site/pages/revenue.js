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
    elevatorPitch: 'OnionDAO brought 400 people to Chicago for a month. Catered meals, restaurant buyouts, hotel stays — all generating sales tax, hotel tax, amusement tax through existing mechanisms. Year two and growing. This tax kills that growth curve before it becomes what SXSW is to Austin. Chicago is spending $40 million a year to attract events like this. The state is taxing away the reason they come.',
  });
}
