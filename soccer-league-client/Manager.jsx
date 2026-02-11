import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Manager() {
    // --- STATE ---
    const [teams, setTeams] = useState([]);
    
    // Team Form State
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDiv, setNewTeamDiv] = useState('Division 1'); // <--- NEW: Division State

    // Player Form State
    const [selectedTeamId, setSelectedTeamId] = useState('');
    const [players, setPlayers] = useState([]);
    const [newPlayerName, setNewPlayerName] = useState('');

    // Match Form State
    const [matches, setMatches] = useState([]);
    const [matchForm, setMatchForm] = useState({ 
        team1_id: '', 
        team2_id: '', 
        date: '' // This will now hold Date AND Time
    });
    
    // Score Editing State
    const [editingMatch, setEditingMatch] = useState(null);
    const [scoreInput, setScoreInput] = useState({ home: 0, away: 0 });

    // --- LOAD DATA ---
    useEffect(() => {
        fetchTeams();
        fetchMatches();
    }, []);

    useEffect(() => {
        if (selectedTeamId) fetchPlayers(selectedTeamId);
        else setPlayers([]);
    }, [selectedTeamId]);

    const fetchTeams = () => axios.get(`${API_URL}/api/teams`).then(res => setTeams(res.data));
    const fetchMatches = () => axios.get(`${API_URL}/api/matches`).then(res => setMatches(res.data));
    const fetchPlayers = (teamId) => axios.get(`${API_URL}/api/players/${teamId}`).then(res => setPlayers(res.data));

    // --- ACTIONS ---

    // 1. ADD TEAM (With Division)
    const handleAddTeam = (e) => {
        e.preventDefault();
        if (!newTeamName) return;

        axios.post(`${API_URL}/api/teams`, { 
            name: newTeamName, 
            division: newTeamDiv // <--- SEND DIVISION
        })
        .then(() => { 
            setNewTeamName(''); 
            fetchTeams(); 
        })
        .catch(err => console.error(err));
    };

    const handleDeleteTeam = (id) => {
        if (confirm("Delete team?")) axios.delete(`${API_URL}/api/teams/${id}`).then(fetchTeams);
    };

    // 2. ADD PLAYER
    const handleAddPlayer = (e) => {
        e.preventDefault();
        if(!newPlayerName || !selectedTeamId) return;
        axios.post(`${API_URL}/api/players`, { name: newPlayerName, team_id: selectedTeamId })
             .then(() => { setNewPlayerName(''); fetchPlayers(selectedTeamId); });
    };

    const handleDeletePlayer = (playerId) => {
        if (confirm("Remove player?")) axios.delete(`${API_URL}/api/players/${playerId}`).then(() => fetchPlayers(selectedTeamId));
    };

    // 3. SCHEDULE MATCH (With Time)
    const handleScheduledMatch = (e) => {
        e.preventDefault();
        const { team1_id, team2_id, date } = matchForm;
        if (!team1_id || !team2_id || !date) return alert("Missing fields");
        if (team1_id === team2_id) return alert("Same team!");

        axios.post(`${API_URL}/api/matches`, matchForm).then(() => {
            alert("Match Scheduled!");
            fetchMatches();
            setMatchForm({ ...matchForm, team1_id: '', team2_id: '' });
        });
    };

    const handleDeleteMatch = (id) => {
        if(confirm("Delete match?")) axios.delete(`${API_URL}/api/matches/${id}`).then(fetchMatches);
    };

    // 4. SCOREBOARD
    const startEditing = (match) => {
        setEditingMatch(match.id);
        setScoreInput({ home: match.home_score || 0, away: match.away_score || 0 });
    };

    const saveScore = (id) => {
        axios.put(`${API_URL}/api/matches/${id}`, {
            homeScore: scoreInput.home,
            awayScore: scoreInput.away
        }).then(() => {
            setEditingMatch(null);
            fetchMatches();
        });
    };

    const getTeamName = (id) => teams.find(t => t.id == id)?.name || 'Unknown';

    return (
    <div className="app-container">
      <h1>League Manager</h1>
      <Link to="/" className="nav-link">← Back to Dashboard</Link>

      <div className="manager-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        
        {/* SECTION 1: ADD TEAMS */}
        <div className="manager-section" style={{ padding: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"}}>
          <h2>Add Teams</h2>
          <form onSubmit={handleAddTeam} style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
            <input 
                type="text" 
                placeholder="Team Name" 
                value={newTeamName} 
                onChange={e => setNewTeamName(e.target.value)} 
            />
            
            {/* NEW: Division Selector */}
            <select value={newTeamDiv} onChange={e => setNewTeamDiv(e.target.value)}>
                <option value="Division 1">Division 1</option>
                <option value="Division 2">Division 2</option>
            </select>

            <button type="submit" className="save-btn">Add</button>
          </form>

          <ul className="list-group">
            {teams.map(t => (
                <li key={t.id} style={{display:'flex', justifyContent:'space-between', padding:'5px'}}>
                    <span>{t.name} <small style={{color:'#888', marginLeft:'5px'}}>({t.division || 'No Div'})</small></span>
                    <button onClick={() => handleDeleteTeam(t.id)} style={{color:'red'}}>X</button>
                </li>
            ))}
          </ul>
        </div>

        {/* SECTION 2: ROSTER */}
        <div className="manager-section" style={{ padding: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"}}>
          <h2>Manage Roster</h2>
          <select onChange={e => setSelectedTeamId(e.target.value)} value={selectedTeamId} style={{width:'100%', marginBottom:'10px'}}>
             <option value="">-- Select Team --</option>
             {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {selectedTeamId && (
            <div>
              <form onSubmit={handleAddPlayer} style={{display:'flex', gap:'5px'}}>
                <input type="text" placeholder="Player Name" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} />
                <button type="submit" className="save-btn">Add</button>
              </form>
              <ul className="list-group">
                {players.map(p => (
                    <li key={p.id}>{p.name} <button onClick={() => handleDeletePlayer(p.id)} style={{color:'red'}}>X</button></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* SECTION 3: SCHEDULE (UPDATED FOR TIME) */}
        <div className="manager-section" style={{  padding: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"}}>
            <h2>Schedule Match</h2>
            <form onSubmit={handleScheduledMatch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                    <select value={matchForm.team1_id} onChange={e => setMatchForm({...matchForm, team1_id: e.target.value})}>
                        <option value="">Home Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <span>VS</span>
                    <select value={matchForm.team2_id} onChange={e => setMatchForm({...matchForm, team2_id: e.target.value})}>
                        <option value="">Away Team</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>

                {/* UPDATED: Uses 'datetime-local' to capture Time */}
                <input 
                    type="datetime-local" 
                    value={matchForm.date} 
                    onChange={e => setMatchForm({...matchForm, date: e.target.value})}
                    style={{padding:'8px'}}
                />

                <button type="submit" className="save-btn">Schedule Game</button>
            </form>
        </div>

        {/* SECTION 4: SCORES */}
        <div className="manager-section" style={{ padding: "5px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
            <h2>Match Results</h2>
            <ul className="list-group">
                {matches.map(m => (
                    <li key={m.id} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                        <div style={{fontWeight:'bold'}}>
                            {getTeamName(m.home_team)} vs {getTeamName(m.away_team)}
                        </div>
                        {/* Display the Time nicely */}
                        <div style={{fontSize:'0.8em', color:'#666', marginBottom:'5px'}}>
                           {new Date(m.date).toLocaleString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
                        </div>

                        {editingMatch === m.id ? (
                            <div>
                                <input type="number" style={{width:'40px'}} value={scoreInput.home} onChange={e => setScoreInput({...scoreInput, home: e.target.value})} />
                                - 
                                <input type="number" style={{width:'40px'}} value={scoreInput.away} onChange={e => setScoreInput({...scoreInput, away: e.target.value})} />
                                <button onClick={() => saveScore(m.id)} style={{marginLeft:'5px', color:'green'}}>Save</button>
                                <button onClick={() => setEditingMatch(null)} style={{marginLeft:'5px'}}>Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <span>Score: {m.home_score} - {m.away_score}</span>
                                <button onClick={() => { setEditingMatch(m.id); setScoreInput({ home: m.home_score, away: m.away_score }); }} style={{marginLeft:'10px'}}>Edit</button>
                                <button onClick={() => handleDeleteMatch(m.id)} style={{marginLeft:'5px', color:'red'}}>Del</button>
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