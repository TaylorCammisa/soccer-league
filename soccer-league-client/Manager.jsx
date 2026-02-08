import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { mac } from 'zod';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


function Manager() {
    const [editingMatch, setEditingMatch] = useState(null);
    const [scoreInput, setScoreInput] = useState({ home: 0, away: 0 });

    // Team State
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');

    // Player State
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');

    // Matches State
    const [matches, setmatches] = useState([]);
    const [matchForm, setMatchForm] = useState({
        team1_id: '',
        team2_id: '',
        date: ''
    });

    // Load existing teams
    useEffect(() => {
        fetchTeams();
        fetchMatches();
    }, []);

    // Load player when team changes
    useEffect(() => {
        if (selectedTeamId) {
            fetchPlayers(selectedTeamId);
        } else {
            setPlayers([]);
        }
    }, [selectedTeamId]);

    const fetchTeams = () => {
        axios.get(`${API_URL}/api/teams`)
            .then(res => setTeams(res.data))
            .catch(err => console.error("Error loading teams:", err));
    };

    // Load Matches
    const fetchMatches = () => {
        axios.get(`${API_URL}/api/matches`)
            .then(res => setmatches(res.data))
            .catch(err => console.error("Error loading matches:", err));
    };

    // Add Teams
    const handleAddTeam = (e) => {
        e.preventDefault();
        if (!newTeamName) return;

        axios.post(`${API_URL}/api/teams`, { name: newTeamName })
            .then(res => {
                setNewTeamName('');
                fetchTeams();
            })
            .catch(err => console.error("Error adding team:", err));
    };

    // Delete a Team
    const handleDeleteTeam = (id) => {
        if (confirm("Are you sure? This will delete the team AND all their players.")) {
            axios.delete(`${API_URL}/api/teams/${id}`)
                .then(() => fetchTeams())
                .catch(err => console.error("Error deleting team:", err));
        }
    };

    // Get Player
    const fetchPlayers = (teamId) => {
        axios.get(`${API_URL}/api/players/${teamId}`)
            .then(res => setPlayers(res.data))
            .catch(err => console.error("Error loading players:", err));
    };
    
    // Add Player
    const handleAddPlayer =(e) => {
        e.preventDefault();
        if(!newPlayerName || !selectedTeamId) return;

        axios.post(`${API_URL}/api/players`, {
            name: newPlayerName,
            team_id: selectedTeamId
        })
            .then(() => {
                setNewPlayerName('');
                fetchPlayers(selectedTeamId);
            })
            .catch(err => console.error("Error adding player:", err));
    };

    // Delete Player
    const handleDeletePlayer = (playerId) => {
        if (confirm("Remove this player?")) {
            axios.delete(`${API_URL}/api/players/${playerId}`)
                .then(() => fetchPlayers(selectedTeamId))
                .catch(err => console.error("Error deleting player:", err));
        }
    };

    // Add Match
    const handleScheduledMatch = (e) => {
        e.preventDefault();
        const { team1_id, team2_id, date } = matchForm;

        if (!team1_id || !team2_id || !date) {
            alert("Please select two teams and a date!");
            return;
        }

        if (team1_id === team2_id) {
            alert("A team cannot play against itself!");
            return;
        }

        axios.post(`${API_URL}/api/matches`, matchForm)
            .then(() => {
                alert("Match Scheduled!");
                fetchMatches();
                setMatchForm({ ...matchForm, team1_id: '', team2_id: '' });
            })
            .catch(err => console.error("Error scheduling match:", err));
    };

    // Save Match
    const saveScore = (id) => {
        axios.put(`${API_URL}/api/matches/${id}`, {
            homeScore: scoreInput.home,
            awayScore: scoreInput.away
        }).then(() => {
            setEditingMatch(null);
            fetchMatches();
        });
    };

    // Delete Match
    const handleDeleteMatch = (id) => {
        if(confirm("Delete this match?")) {
            axios.delete(`${API_URL}/api/matches/${id}`)
                .then(() => fetchMatches())
                .catch(err => console.error(err));
        }
    };

    // TeamID -> Team Name Helper
    const getTeamName = (id) => {
        const team = teams.find(t => t.id == id);
        return team ? team.name : 'Unknown Team';
    };

    return (
    <div className="app-container">
      <h1>League Manager</h1>
      <Link to="/" className="nav-link">← Back to Dashboard</Link>

      <div className="manager-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* COLUMN 1: TEAMS */}
        <div className="manager-section">
          <h2>1. Manage Teams</h2>
          <form onSubmit={handleAddTeam} style={{ marginBottom: '15px' }}>
            <input 
              type="text" 
              placeholder="New Team Name" 
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              style={{ padding: '8px', marginRight: '5px' }}
            />
            <button type="submit" className="save-btn">Add Team</button>
          </form>

          <ul className="list-group">
            {teams.map(team => (
              <li key={team.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #eee' }}>
                <span>{team.name}</span>
                <button 
                  onClick={() => handleDeleteTeam(team.id)}
                  style={{ background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', cursor: 'pointer' }}
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* COLUMN 2: ROSTER */}
        <div className="manager-section" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
          <h2>2. Manage Roster</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Select Team to Edit: </label>
            <select 
              value={selectedTeamId} 
              onChange={(e) => setSelectedTeamId(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            >
              <option value="">-- Select a Team --</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {selectedTeamId && (
            <>
              <form onSubmit={handleAddPlayer} style={{ marginBottom: '15px' }}>
                <input 
                  type="text" 
                  placeholder="Player Name" 
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  style={{ padding: '8px', width: '60%', marginRight: '5px' }}
                />
                <button type="submit" className="save-btn">Add Player</button>
              </form>

              <ul className="list-group">
                {players.length === 0 && <p style={{ color: '#888' }}>No players yet.</p>}
                {players.map(player => (
                  <li key={player.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                    <span>⚽ {player.name}</span>
                    <button 
                      onClick={() => handleDeletePlayer(player.id)}
                      style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* COLUMN 1: Schedule */}
        <div className="manager-section" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc' }}>
            <h2>Schedule Matches</h2>

            <form onSubmit={handleScheduledMatch} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <select
                    value={matchForm.team1_id}
                    onChange={(e) => setMatchForm({...matchForm, team1_id: e.target.value})}
                >
                    <option value="">Home Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <span>VS</span>

                <select
                    value={matchForm.team2_id}
                    onChange={(e) => setMatchForm({...matchForm, team2_id: e.target.value})}
                >
                    <option value="">Away Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                <input
                    type="date"
                    value={matchForm.date}
                    onChange={(e) => setMatchForm({...matchForm, date: e.target.value})}
                />

                <button type="submit" className="save-btn">Schedule</button>
            </form> 

            <ul className="List-group">
                {matches.map(m => (
                    <li key={m.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <div style={{fontWeight:'bold'}}>
                            {getTeamName(m.home_team)} vs {getTeamName(m.away_team)}
                        </div>

                        {editingMatch === m.id ? (
                            <div style={{marginTop:'5px'}}>
                                {/* Edit Mode */}
                                <input type="number" style={{width:'40px'}} value={scoreInput.home}
                                onChange={e => setScoreInput({...scoreInput, home: e.target.value})} />
                                -
                                <input type="number" style={{width:'40px'}} value={scoreInput.away}
                                    onChange={e => setScoreInput({...scoreInput, away: e.target.value})} />
                                
                                <button onClick={() => saveScore(m.id)} style={{marginLeft:'5px', background:'green', color:'white'}}>Save</button>
                                <button onClick={() => setEditingMatch(null)} style={{marginLeft:'5px'}}>Cancel</button>
                            </div>
                        ) : (
                            <div style={{marginTop:'5px'}}>
                                <span>Score: {m.home_score} - {m.away_score}</span>
                                <span style={{marginLeft:'10px', fontSize:'0.8em', color: m.status === 'completed' ? 'green' : 'orange'}}>
                                    ({m.status})
                                </span>

                                <button onClick={() => {
                                    setEditingMatch(m.id);
                                    setScoreInput({ home: m.home_score, away: m.away_score });
                                }}  style={{marginLeft:'10px'}}>Update Score</button>

                                <button onClick={() => handleDeleteMatch(m.id)} style={{marginLeft:'5px', color: 'red'}}>Delete</button>
                           </div>
                        )}
                    </li>
                ))}
            </ul>           
        </div>
      </div>
    </div>
  );
}

export default Manager;