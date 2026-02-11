// src/components/Matches.jsx
import { useState } from 'react'

function Matches ({ matches, isAdmin, onUpdateScore }) {
  return (
    <div style={{ marginBottom: "40px" }}>
      <h3>Match Schedule</h3>
      <div style={{ display: "grid", gap: "10px" }}>
        {matches.map((match) =>( 
          <MatchCard
            key={match.id}
            match={match}
            isAdmin={isAdmin}
            onUpdate={onUpdateScore}
          />
        ))}
      </div>
    </div>     
  )
}

function MatchCard({ match, isAdmin, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false)
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")

  const handleSave = () => {
    onUpdate(match.id, homeScore, awayScore)
    setIsEditing(false)
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px", background: "#f9f9f9" }}>
      <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
        {match.home_team} vs {match.away_team}
      </div>
      <div style={{ color: "#666", fontSize: "0.9em" }}>
        {match.date} @ {match.time}
      </div>
      {isAdmin && isEditing ? (
        <div style={{ marginTop: "10px" }}>
          <input
            type="number"
            placeholder="H"
            style={{ width: "40px", marginRight: "5px" }}
            onChange={(e) => setHomeScore(e.target.value)}
          />
          -
          <input
            type="number"
            placeholder="A"
            style= {{ width: "40px", marginLeft: "5px", marginRight: "10px" }}
            onChange={(e) => setAwayScore(e.target.value)}
          />
          <button onClick={handleSave} style={{ background: "green", color: "white", border: "none", cursor: "pointer" }}>
            Save
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "5px", fontWeight: "bold", color: "blue", display: "flex", justifyContent: "space-between" }}>
          <span>
            Result: {match.status === 'completed' ? `${match.home_score} - ${match.away_score}` : "Upcoming"}
          </span>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              style={{ fontSize: "0.8em", cursor: "pointer" }}
            >
              Edit Result
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Matches
