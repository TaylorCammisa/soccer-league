import { mockTeams } from '../data/mockData'

function TeamCards() {
  return (
    <div style={{ marginTop: "40px" }}>
      <h3>Team Rosters</h3>
      {/* Grid layout: 2 cards per row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
      }}>

        {mockTeams.map((team) => (
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
              {team.players.map((player, index) => (
                <li key={index} style={{ color: "#555"}}>
                  {player}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamCards