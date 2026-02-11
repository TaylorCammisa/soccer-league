import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const EMPTY_GROUPS = { 'Division 1': {}, 'Division 2': {}, 'Cross-Division': {} };

function normalizeDivision(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === '1' || raw === 'division 1' || raw === 'd1') return 'Division 1';
  if (raw === '2' || raw === 'division 2' || raw === 'd2') return 'Division 2';
  return String(value ?? '').trim();
}

function buildGroupedSchedule(teams, matches) {
  const getTeamInfo = (id) => teams.find(t => t.id == id);
  const structure = {
    'Division 1': {},
    'Division 2': {},
    'Cross-Division': {}
  };

  matches.forEach(match => {
    const homeTeam = getTeamInfo(match.home_team);
    const awayTeam = getTeamInfo(match.away_team);
    if (!homeTeam || !awayTeam) return;

    const homeDivision = normalizeDivision(homeTeam.division);
    const awayDivision = normalizeDivision(awayTeam.division);

    let div = homeDivision || 'Unassigned';
    if (homeDivision && awayDivision && homeDivision !== awayDivision) {
      div = 'Cross-Division';
    }

    const dateObj = new Date(match.date);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    if (!structure[div]) {
      structure[div] = {};
    }
    if (!structure[div][dayName]) {
      structure[div][dayName] = [];
    }

    structure[div][dayName].push({
      ...match,
      homeName: homeTeam.name,
      awayName: awayTeam.name,
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
  });

  return structure;
}

function Home() {
  const [groupedMatches, setGroupedMatches] = useState(EMPTY_GROUPS);
  const [loading, setLoading] = useState(true);

  function renderDivisionSection(divName, daysObject) {
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
                  style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '15px',
                    borderBottom: '1px dotted #eee',
                    alignItems: 'center',
                    background: 'white',
                    marginBottom: '10px',
                    borderRadius: '8px'
                  }}
                >
                  <span className="match-time" style={{ fontWeight: 'bold', minWidth: '80px', color: '#2c3e50' }}>
                    {m.time}
                  </span>

                  <span className="match-teams">
                    {m.homeName} <span style={{ color: '#888', fontSize: '0.9rem' }}>vs</span> {m.awayName}
                    {m.status === 'completed' && (
                      <span style={{ fontWeight: 'bold', marginLeft: '10px', color: 'green' }}>
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
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, matchesRes] = await Promise.all([
          axios.get(`${API_URL}/api/teams`),
          axios.get(`${API_URL}/api/matches`)
        ]);

        setGroupedMatches(buildGroupedSchedule(teamsRes.data, matchesRes.data));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading Schedule...</div>;

  return (
    <div className="page-container">
      <h1 style={{ textAlign: 'center' }}>Match Schedule</h1>
      {renderDivisionSection('Division 1', groupedMatches['Division 1'])}
      {renderDivisionSection('Division 2', groupedMatches['Division 2'])}
      {renderDivisionSection('Cross-Division', groupedMatches['Cross-Division'])}
    </div>
  );
}

export default Home;
