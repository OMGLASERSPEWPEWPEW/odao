/* ============================================================
   Gamification Engine — XP, streaks, badges (localStorage)
   ============================================================ */

const PROFILE_KEY = 'repeal-data-profile';

const DEFAULT_PROFILE = {
  xp: 0,
  streak: 0,
  badges: [],
  lastActiveDate: null,
};

export function getProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROFILE_KEY));
    return { ...DEFAULT_PROFILE, ...stored };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function addXP(amount) {
  const profile = getProfile();
  profile.xp += amount;
  updateStreak(profile);
  saveProfile(profile);
  return profile;
}

export function updateStreak(profile = null) {
  if (!profile) profile = getProfile();

  const today = new Date().toISOString().slice(0, 10);
  const lastActive = profile.lastActiveDate;

  if (!lastActive) {
    // First activity ever
    profile.streak = 1;
  } else if (lastActive === today) {
    // Already active today — no change
  } else {
    const lastDate = new Date(lastActive + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day
      profile.streak += 1;
    } else {
      // Streak broken
      profile.streak = 1;
    }
  }

  profile.lastActiveDate = today;
  saveProfile(profile);
  return profile;
}

export function getLevel(xp) {
  return Math.floor(xp / 500) + 1;
}

export function getXPForNextLevel(xp) {
  const level = getLevel(xp);
  return level * 500;
}

export function getXPProgress(xp) {
  const currentLevelStart = (getLevel(xp) - 1) * 500;
  const nextLevelXP = getLevel(xp) * 500;
  return (xp - currentLevelStart) / (nextLevelXP - currentLevelStart);
}

// Badge definitions
export const BADGE_DEFS = [
  { id: 'first-mission', name: 'First Steps', desc: 'Complete your first mission', icon: 'star', check: (p) => p.xp > 0 },
  { id: 'streak-3', name: 'On Fire', desc: '3-day streak', icon: 'flame', check: (p) => p.streak >= 3 },
  { id: 'streak-7', name: 'Unstoppable', desc: '7-day streak', icon: 'lightning', check: (p) => p.streak >= 7 },
  { id: 'xp-500', name: 'Level Up', desc: 'Reach 500 XP', icon: 'trophy', check: (p) => p.xp >= 500 },
  { id: 'xp-2000', name: 'Veteran', desc: 'Reach 2000 XP', icon: 'shield', check: (p) => p.xp >= 2000 },
  { id: 'missions-5', name: 'Dedicated', desc: 'Complete 5 missions', icon: 'check', check: (p) => (p.completedCount || 0) >= 5 },
  { id: 'missions-20', name: 'Relentless', desc: 'Complete 20 missions', icon: 'crown', check: (p) => (p.completedCount || 0) >= 20 },
  { id: 'streak-30', name: 'Legend', desc: '30-day streak', icon: 'diamond', check: (p) => p.streak >= 30 },
];

export function checkBadges(profile, completedCount = 0) {
  const profileWithCount = { ...profile, completedCount };
  const newlyEarned = [];

  BADGE_DEFS.forEach(badge => {
    if (badge.check(profileWithCount) && !profile.badges.includes(badge.id)) {
      profile.badges.push(badge.id);
      newlyEarned.push(badge);
    }
  });

  if (newlyEarned.length > 0) {
    saveProfile(profile);
  }

  return newlyEarned;
}
