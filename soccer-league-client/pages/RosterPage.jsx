import React, { useEffect, useState } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function RosterPage() {
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const [tRes, pRes] = await Promise.all([
                axios.get(`${API_URL}/api/teams`),
                axios.get(`${API_URL}/api/players`)
            ]);
            setTeams(tRes.data);
            setPlayers(pRes.data);
        };
        fetchData();
    }, []);

    const renderTeamGrid = (teamList) => (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "4px", marginBottom: '40px' }}>
            {teamList.map(team => {
                const teamPlayers = players.filter(p => p.team_id === team.id);
                return (
                    <div key={team.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "15px", background: "white"}}>
                        <h4 style={{ margin: "0 0 10px 0", borderBottom: "2px solid #333", paddingBottom: "5px" }}>{team.name}</h4>
                        <ul style={{ paddingLeft: "20px", margin: 0 }}>
                            {teamPlayers.length === 0 && <li style={{color: "#999", listStyle: 'none'}}>No Players Signed</li>}
                            {teamPlayers.map(p => <li key={p.id} style={{ color: "#555" }}>{p.name}</li>)}
                        </ul>
                    </div>
                );
            })}
        </div>
    );


    const div1 = teams.filter(t => t.division === 1);
    const div2 = teams.filter(t => t.division === 2);

    return (
        <div className="page-container">
            <h1 style={{textAlign: 'center' }}>League Rosters</h1>

            <h2 style={{color: "#2c3e50", borderBottom: '2px solid #eee', paddingBottom: "10px", textAlign: 'center' }}>Division 1</h2>
            {renderTeamGrid(div1)}

            <h2 style={{color: "#2c3e50", borderBottom: '2px solid #eee', paddingBottom: "10px", textAlign: 'center' }}>Division 2</h2>
            {renderTeamGrid(div2)}
        </div>
    );
}

export default RosterPage;
