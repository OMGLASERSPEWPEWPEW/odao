/* ============================================================
   Carve-Out Page — community event exemption track with Game Room
   ============================================================ */

import { renderGameRoom } from '../lib/gameroom.js';
import { renderSharedSections } from '../lib/shared-sections.js';

export async function renderCarveout() {
  const container = document.getElementById('page-carveout');
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
    trackName: 'Carve-Out',
    trackColor: '#22C55E',
    trackSlug: 'carveout',
    headerClass: 'carveout-header',
    elevatorPitch: 'We\'re not asking to kill the tax. We\'re asking to protect community builders. OnionDAO brought 400 people to Chicago for free workshops, free food, and free education for a month. The organizer took no profit. We want an exemption for nonprofit community events — the same exemption Illinois already gives churches and universities.',
  });

  // Shared supporting sections
  await renderSharedSections(container);
}
