import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Home() {
  const [groupedMatches, setGroupedMatches] = useState({ div1: {}, div2: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, matchesRes] = await Promise.all([
          axios.get(`${API_URL}/api/teams`),
          axios.get(`${API_URL}/api/matches`)
        ]);

        processSchedule(teamsRes.data, matchesRes.data);
        setLoading(false);
      } catch (err) { console.error(err); setLoading(false); }
    };
    fetchData();
  }, []);

  const processSchedule = (teams, matches) => {
    // 1. Helper to find a team's name and division
    const getTeamInfo = (id) => teams.find(t => t.id == id);

    // 2. Buckets for our sorted data
    const structure = { 
        'Division 1': {}, 
        'Division 2': {} 
    };

    matches.forEach(match => {
        const homeTeam = getTeamInfo(match.home_team);
        const awayTeam = getTeamInfo(match.away_team);
        if (!homeTeam || !awayTeam) return;

        // Determine which division this match belongs to (based on Home Team)
        let div = homeTeam.division;
        
        // Convert "1" or 1 to "Division 1"
        if (div == 1 || div === '1') div = 'Division 1';
        // Convert "2" or 2 to "Division 2"
        else if (div == 2 || div === '2') div = 'Division 2';
        // Handle nulls
        else if (!div) div = 'Unassigned';
        
        // Get the day name (e.g., "Friday")
        const dateObj = new Date(match.date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        
        // Initialize the array if it doesn't exist
        if (!structure[div][dayName]) {
            structure[div][dayName] = [];
        }

        // Add the match with translated names
        structure[div][dayName].push({
            ...match,
            homeName: homeTeam.name,
            awayName: awayTeam.name,
            time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) // e.g. "7:00 PM"
        });
    });

    setGroupedMatches(structure);
  };

  // Helper to render one division's schedule
  const renderDivisionSection = (divName, daysObject) => {
    if (!daysObject || Object.keys(daysObject).length === 0) return null;

    return (
      <div key={divName} style={{ marginBottom: '40px' }}>
        <h2 style={{ background: '#2c3e50', color: 'white', padding: '10px', borderRadius: '5px' }}>
            {divName}
        </h2>
        {Object.keys(daysObject).map(day => (
          <div key={day} style={{ marginLeft: '20px', marginBottom: '20px' }}>
            <h3 style={{ borderBottom: '1px solid #ccc', color: '#555' }}>{day}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {daysObject[day].map(m => (
                <li 
                  key={m.id} 
                  className="match-card"
                  style={{ display: 'flex', gap: '20px', padding: '15px', borderBottom: '1px dotted #eee', alignItems: 'center', background: 'white', marginBottom:'10px', borderRadius:'8px' }}
                >
                  <span 
                    className="match-time"
                    style={{ fontWeight: 'bold', minWidth: '80px', color: '#2c3e50' }}
                  >
                    {m.time}
                  </span>
                  
                  <span className="match-teams">
                    {m.homeName} <span style={{color:'#888', fontSize:'0.9rem'}}>vs</span> {m.awayName}
                    {m.status === 'completed' && (
                        <span style={{fontWeight:'bold', marginLeft:'10px', color: 'green'}}>
                            ({m.home_score} - {m.away_score})
                        </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>⚽ Loading Schedule...</div>;

  return (
    <div className="page-container">
      <h1 style={{textAlign: 'center'}}>Match Schedule</h1>
      {renderDivisionSection('Division 1', groupedMatches['Division 1'])}
      {renderDivisionSection('Division 2', groupedMatches['Division 2'])}
    </div>
  );
}

export default Home;