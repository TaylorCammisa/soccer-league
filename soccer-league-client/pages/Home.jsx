import React, { useState, useEffect } from 'react';
import axios from 'axios'
import Matches from '../components/Matches';

const API_URL = import.meta.env.VIT_API_URL || 'http://localhost:3000';

function Home() {
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamRes, matchesRes] = await Promise.all([
                    axios.get(`${API_URL}/api/teams`),
                    axios.get(`${API_URL}/api/matches`)
                ]);

                setTeams(teamRes.data);
                setMatches(matchesRes.data);
                setLoading(false);
            }   catch (err) {
                console.error("Error fetching data:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '1.2rem', color: '#666'}}>
                Loading Season Data... (Server waking up)
            </div>
        );
    }

    const matchesWithNames = matches.map(m => ({
        ...m,
        home_team: teams.find(t => t.id == m.home_team)?.name || "Unknown",
        away_team: teams.find(t => t.id == m.away_team)?.name || "Unknown"
    }));

    return (
        <div className="page-container">
            <h2 style={{ textAlign: 'center' }}>Match Schedule</h2>
            <Matches matches={matchesWithNames} isAdmin={false} />
        </div>
    );
}

export default Home;