// src/data/mockData.js
export const mockTeams = [
  { id: 1, 
    name: "Thunder FC", 
    wins: 5, losses: 1, draws: 2, points: 17,
    players: ["Alex Johnson", "Mike Ross", "David Kim", "Sam Smith"] 
  },
  { id: 2, 
    name: "Valley Strikers", 
    wins: 3, losses: 2, draws: 3, points: 12,
    players: ["Chris Pratt", "Tony Hawk", "Bruce Wayne", "Clark Kent"]
  },
  { id: 3, 
    name: "Stockton City", 
    wins: 2, losses: 5, draws: 1, points: 7,
    players: ["Mario", "Luigi", "Yoshi", "Toad"]
  },
  { id: 4, 
    name: "Goal Diggers", 
    wins: 0, losses: 8, draws: 0, points: 0,
    players: ["SpongeBob","Patrick", "Squidward", "Mr. Krabs"]
  },
];

export const mockMatches = [
  { id: 1, home: "Thunder FC", away: "Stockton City", date: "2026-02-10", time: "19:00", result: "3 - 1" },
  { id: 2, home: "Valley Strikers", away: "Goal Diggers", date: "2026-02-12", time: "18:30", result: "Not Played" },
  { id: 3, home: "Goal Diggers", away: "Thunder FC", date: "2026-02-18", time: "14:00", result: "Not Played"},
];