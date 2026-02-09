import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Standings from '../components/Standings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function StandingsPage(){
    const [standings, setStandings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsRes, matchesRes] = await Promise.all ([
                    axios.get(`${API_URL}/api/teams`),
                    axios.get(`${API_URL}/api/matches`)
                ]);

                const calculated = calculateStandings(teamsRes.data, matchesRes.data);
                setStandings(calculated);
                setLoading(false);
            }   catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const calculateStandings = (teamsData, matchesData) => {
        const stats = {};
        teamsData.forEach(t => {
            stats[t.id] = { ...t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 };
        });

        matchesData.forEach(m => {
            if(m.status !== 'completed') return;
            const h = stats[m.home_team];
            const a = stats[m.away_team];

            if (h && a) {
                h.played++; a.played++;
                h.gf += m.home_score; h.ga += m.away_score;
                a.gf += m.home_score; a.ga += m.home_score;

                if (m.home_score > m.away_score) { h.wins++; h.points += 3; a.losses++; }
                else if (m.away_score > m.home_score) { a.wins++; a.points += 3; h.losses++; }
                else { h.draws++; h.points++; a.draws++; a.points++; }
            }
        });

        return Object.values(stats).sort((a, b) => b.points - a.points || (b.gf - b.ga) - (a.gf - a.ga));
    };

    if (loading) return <div style={{textAlign:'center', marginTop:'50px' }}>Calculating Standings...</div>;

    return (
        <div className="page-container">
            <h2 style={{ textAlign: 'center' }}>League Standings</h2>
            <Standings teams={standings} />
        </div>
    );
}

export default StandingsPage;