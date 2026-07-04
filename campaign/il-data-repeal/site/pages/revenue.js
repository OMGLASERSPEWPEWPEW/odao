/* ============================================================
   Revenue Track — Tax Revenue Engine game room
   ============================================================ */

import { renderGameRoom } from '../lib/gameroom.js';
import { renderSharedSections } from '../lib/shared-sections.js';

export async function renderRevenue() {
  const container = document.getElementById('page-revenue');
  if (!container) return;

  // Clear previous content (re-render on each navigation)
  container.innerHTML = '';

  // Game Room section wrapper
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
  });

  // Shared supporting sections
  await renderSharedSections(container);
}
