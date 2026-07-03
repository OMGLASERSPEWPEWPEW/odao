/* ============================================================
   Missions Engine — daily missions with localStorage tracking
   ============================================================ */

const STORAGE_KEY = 'repeal-data-completed-missions';

let missionsCache = null;

export async function loadMissions() {
  if (missionsCache) return missionsCache;
  try {
    const res = await fetch('/missions.json');
    missionsCache = await res.json();
    return missionsCache;
  } catch (err) {
    console.error('Failed to load missions:', err);
    return [];
  }
}

/**
 * Get today's missions. The data is grouped by date, each entry having a
 * `missions` array. If there's no entry for today, return the most recent
 * past day's missions as a fallback.
 */
export function getTodayMissions(allDays, track = null) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Find today's entry
  let dayEntry = allDays.find(d => d.date === today);

  // If nothing for today, find the most recent past entry
  if (!dayEntry) {
    const pastEntries = allDays
      .filter(d => d.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
    dayEntry = pastEntries[0];
  }

  if (!dayEntry) return [];

  let missions = dayEntry.missions || [];

  // Filter by track if specified
  if (track) {
    // Also include from the parent entry if the day itself has a track
    const dayTrack = dayEntry.track;
    if (dayTrack && dayTrack !== 'both' && dayTrack !== track) {
      return [];
    }
  }

  return missions;
}

/**
 * Get all missions from all days (flattened), optionally filtered by track.
 */
export function getAllMissions(allDays, track = null) {
  const all = [];
  allDays.forEach(day => {
    const dayTrack = day.track;
    (day.missions || []).forEach(m => {
      // Inherit track from day if mission doesn't have one
      const missionTrack = m.track || dayTrack || 'both';
      if (!track || missionTrack === track || missionTrack === 'both') {
        all.push({ ...m, _dayTrack: missionTrack, _date: day.date });
      }
    });
  });
  return all;
}

export function completeMission(id) {
  const completed = getCompletedMissions();
  if (!completed.find(c => c.id === id)) {
    completed.push({ id, completedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }
}

export function isCompleted(id) {
  const completed = getCompletedMissions();
  return completed.some(c => c.id === id);
}

export function getCompletedMissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function getCompletedCount() {
  return getCompletedMissions().length;
}
