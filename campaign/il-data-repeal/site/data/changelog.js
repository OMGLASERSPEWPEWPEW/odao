export const CHANGELOG = [
  {
    version: '0.1.2',
    date: '2026-07-06',
    title: 'Auto-update, auth, and one-pagers',
    summary: 'Service worker with auto-update banner, username/password auth, human-calibrated XP, proof uploads, and print-ready one-pagers for Rep. Andrade.',
    details: [
      'Service worker — site auto-detects new deploys and prompts to reload',
      'Username/password auth with rate-limited login (5 attempts/hour)',
      'XP recalibrated to human effort: visits=200, calls=25, testify=500',
      'Per-legislator bounties auto-generated from committee data (60+ quests)',
      'Proof-of-work uploads on quest claims (public gallery)',
      'Tax policy + community one-pagers hosted at /docs/',
      'Copy-link buttons on all shared documents',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-07-06',
    title: 'Campaign ops platform',
    summary: 'Full campaign operations hub — version stamp, grouped nav, quest board, activity feed, leaderboard, video journal, idea zone, documentation library, and shared documents.',
    details: [
      'Glyffiti-style version stamp with changelog dropdown',
      'Grouped navigation with dropdown menus',
      'Supabase backend for multi-user features',
      'Quest board with call/visit/research tasks',
      'Activity feed and leaderboard',
      'Video journal with direct upload',
      'Idea zone with community voting',
      'Documentation browser and shared file library',
    ],
  },
];
