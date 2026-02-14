// src/components/Standings.jsx
function Standings({ teams }) {
  if (!teams || teams.length === 0) {
    return <p style={{ textAlign: 'center', color: '#667', marginTop: '12px' }}>No standings available.</p>;
  }

  return (
    <div className="standings-section">
      <div className="table-scroll">
        <table className="standings-table" border="1" cellPadding="10">
          <thead>
            <tr style={{ backgroundColor: '#eee' }}>
              <th>Rank</th>
              <th>Team Name</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team, index) => (
              <tr key={team.id}>
                <td>{index + 1}</td>
                <td>{team.name}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td>{team.gf}</td>
                <td>{team.ga}</td>
                <td style={{ fontWeight: 'bold' }}>{team.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="standings-mobile-list">
        {teams.map((team, index) => (
          <article key={team.id} className="standings-mobile-card">
            <div className="standings-mobile-card-header">
              <span className="standings-rank">#{index + 1}</span>
              <span className="standings-team-name">{team.name}</span>
              <span className="standings-points">{team.points} pts</span>
            </div>
            <div className="standings-mobile-stats">
              <span>W {team.wins}</span>
              <span>D {team.draws}</span>
              <span>L {team.losses}</span>
              <span>GF {team.gf}</span>
              <span>GA {team.ga}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Standings;
