const STORAGE_KEY = 'resqvision-leaderboard-v1';

export function loadLeaderboard() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved.filter((entry) => Number.isFinite(entry.score)) : [];
  } catch {
    return [];
  }
}

export function saveScore(score, rescued) {
  const scores = [...loadLeaderboard(), { score, rescued, date: new Date().toLocaleDateString() }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  return scores;
}
