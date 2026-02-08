import { useState, useEffect } from 'react'
import axios from 'axios'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import Standings from './components/Standings'
import Matches from './components/Matches'
import TeamCards from './components/TeamCards'

function PublicDashboard() {
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch Teams/Matches
  useEffect(() => {
    const loadData = async () => {
        try {
            const [tRes, mRes] = await Promise.all([
                axios.get(`${API_URL}/api/teams`),
                axios.get(`${API_URL}/api/matches`)
            ]);
            setTeams(tRes.data);
            setMatches(mRes.data);
            const calculated = calculateStandings(tRes.data, mRes.data);
            setStandings(calculated);
        }   catch (err) { console.error(err); }
    };
    loadData();
    }, []);

  // Calculate Standings
  const [standings, setStandings] = useState([]);
  const calculateStandings = (teamsData, matchesData) => {
    const stats = {};
    teamsData.forEach(t => {
        stats[t.id] = {...t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 };
    });

    matchesData.forEach(m => {
        if(m.status !== 'completed') return; //Only count finished Games
        const h = stats[m.home_team];
        const a = stats[m.away_team];

        if (h && a) {
            h.played++; a.played++;
            h.gf += m.home_score; h.ga += m.away_score;
            a.gf += m.away_score; a.ga += m.home_score;

            if (m.home_score > m.away_score) { h.wins++; h.points += 3; a.losses++; }
            else if (m.away_score > m.home_score) {a.wins++; a.points += 3; h.losses++; }
            else {  h.draws++; h.points++; a.draws++; a.points++; }
        }
    });

    return Object.values(stats).sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header Section with conditional Logic */}
      <div style= {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Soccer League Dashboard</h1>
      </div>
      <hr />
      <Standings teams={standings}/>
      <Matches matches={matches.map(m => ({
        ...m,
        home_team: teams.find(t => t.id == m.home_team)?.name || "Unknown",
        away_team: teams.find(t => t.id == m.away_team)?.name || "Unknown"
      }))}
      isAdmin={false}
      />
      <TeamCards teams={teams}/>
      <Analytics />
      <SpeedInsights />
    </div>
  )
}

export default PublicDashboard
