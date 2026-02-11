// src/components/Standings.jsx
function Standings({ teams }) {
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif"}} >
      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th>#</th>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>D</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr key={team.id}>
              <td>{index + 1}</td>
              <td>{team.name}</td>
              <td>{team.wins}</td>
              <td>{team.losses}</td>
              <td>{team.draws}</td>
              <td style={{ fontWeight: "bold" }}>{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

  )
}

export default Standings