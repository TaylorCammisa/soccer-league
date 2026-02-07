import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function TeamCards() {
  const [teams, setTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, playerRes] = await Promise.all([
          axios.get(`${API_URL}/api/teams`),
          axios.get(`${API_URL}/api/players`)
        ]);

        setTeams(teamsRes.data);
        setAllPlayers(playerRes.data);
      } catch (err) {
        console.error("Error loading roster data:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Team Rosters</h3>

    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "20px"
    }}>

      {teams.map((team) => {
        const teamPlayers = allPlayers.filter(player => player.team_id === team.id);

        return (
          <div key={team.id} style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              backgroundColor: "white",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
            }}>
              <h4 style={{ margin: "0 0 10px 0", borderBottom: "2px solid #333", paddingBottom: "5px" }}>
                {team.name}
              </h4>

              <ul style={{ paddingLeft: "20px", margin: 0 }}>
                {teamPlayers.length === 0 && <li style={{color: '#999', listStyle: 'none'}}>No Players Signed</li>}
                {teamPlayers.map((player) => (
                  <li key={player.id} style={{ color: "#555" }}>
                    {player.name}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TeamCards;