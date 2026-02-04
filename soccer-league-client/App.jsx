import { useState, useEffect } from 'react'
import axios from 'axios'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import Standings from './components/Standings'
import Matches from './components/Matches'
import TeamCards from './components/TeamCards'
import Login from './components/Login'

function App() {
  //Tracks if user is logged in, default is (guest/false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const updateScore = (id, newHomeScore, newAwayScore) => {
    // Call the API to save to Database
    axios.put(`${API_URL}/api/matches/${id}`, {
      homeScore: newHomeScore,
      awayScore: newAwayScore
    })
    .then((response) => {
      // Update local state
      const updatedMatch = response.data;
      const updatedMatches = matches.map(match => {
        if (match.id === id) return updatedMatch; 
        return match;
      });
      setMatches(updatedMatches);
      axios.get(`${API_URL}/api/teams`)
        .then((res) => {
          console.log("Standings Updated!");
          setTeams(res.data);
        })
        .catch((err) => console.error("Error refreshing standings:", err));
    })
    .catch((error) => console.error("Error updating score:", error));
  }

  useEffect(() => {
    axios.get(`${API_URL}/api/teams`)
      .then((response) => {
        setTeams(response.data)
      })
      .catch((error) => console.error("Error fetching teams:", error));

    axios.get(`${API_URL}/api/matches`)
      .then((response) => setMatches(response.data))
      .catch((error) => console.error("Error fetching matches:", error));
  }, [])

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header Section with conditional Logic */}
      <div style= {{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Soccer League Dashboard</h1>

        {/* Conditional Rendering:
            If isAdmin is true -> Show "Logout" button.
            If isAdmin is false -> Show nothing
        */}
        {isAdmin && (
          <button
            onClick={() => setIsAdmin(false)}
            style={{ backgroundColor: "red", color: "white", border: "none", padding: "10px", cursor: "pointer"}}
          >
            Logout
          </button>
        )}
      </div>
      <hr />
        {/* Logic Gate:
          If NOT admin (!isAdmin), show the Login form.
          If IS admin, show a welcome message.
        */}
      {!isAdmin ? (
        <Login onLogin={setIsAdmin} />
      ) : (
        <div style={{ backgroundColor: "#d4edda", color: "#155724", padding: "10px", marginBottom: "20px" }}>
          <b>Admin Mode Active:</b> You can now edit scores
        </div>
      )}
      <Standings teams={teams}/>
      <Matches matches={matches} isAdmin={isAdmin} onUpdateScore={updateScore}/>
      <TeamCards teams={teams}/>
      <Analytics />
      <SpeedInsights />
    </div>
  )
}

export default App
