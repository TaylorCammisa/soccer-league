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
        <div className="roster-grid">
            {teamList.map(team => {
                const teamPlayers = players.filter(p => p.team_id === team.id);
                return (
                    <div key={team.id} className="roster-card">
                        <h4>{team.name}</h4>
                        <ul>
                            {teamPlayers.length === 0 && <li className="roster-empty">No Players Signed</li>}
                            {teamPlayers.map(p => <li key={p.id}>{p.name}</li>)}
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
            <h1>League Rosters</h1>

            <h2 className="roster-division-heading">Division 1</h2>
            {renderTeamGrid(div1)}

            <h2 className="roster-division-heading">Division 2</h2>
            {renderTeamGrid(div2)}
        </div>
    );
}

export default RosterPage;
