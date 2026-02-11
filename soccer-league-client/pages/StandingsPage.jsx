import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Standings from '../components/Standings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function StandingsPage() {
  const [standings1, setStandings1] = useState([]);
  const [standings2, setStandings2] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tRes, mRes] = await Promise.all([
          axios.get(`${API_URL}/api/teams`),
          axios.get(`${API_URL}/api/matches`)
        ]);

        // 1. Split Teams by Division
        const div1Teams = tRes.data.filter(t => t.division === 1);
        const div2Teams = tRes.data.filter(t => t.division === 2);

        // 2. Calculate separately
        setStandings1(calculateStandings(div1Teams, mRes.data));
        setStandings2(calculateStandings(div2Teams, mRes.data));
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchData();
  }, []);

  const calculateStandings = (teamList, allMatches) => {
    const stats = {};
    // Initialize only for this division's teams
    teamList.forEach(t => {
      stats[t.id] = { ...t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 };
    });

    allMatches.forEach(m => {
      if (m.status !== 'completed') return;
      // Only process if BOTH teams are in this division list
      const h = stats[m.home_team];
      const a = stats[m.away_team];
      
      if (h && a) {
        h.played++; a.played++;
        h.gf += m.home_score; h.ga += m.away_score;
        a.gf += m.away_score; a.ga += m.home_score;
        
        if (m.home_score > m.away_score) { h.wins++; h.points += 3; a.losses++; }
        else if (m.away_score > m.home_score) { a.wins++; a.points += 3; h.losses++; }
        else { h.draws++; h.points++; a.draws++; a.points++; }
      }
    });

    return Object.values(stats).sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Calculating...</div>;

  return (
    <div className="page-container">
      <h2 style={{textAlign: 'center'}}>Division 1 Standings</h2>
      <Standings teams={standings1} />
      
      <h2 style={{marginTop: '40px', textAlign: 'center'}}>Division 2 Standings</h2>
      <Standings teams={standings2} />
    </div>
  );
}

export default StandingsPage;