import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Login({ onLogin }) {
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { username, password })
      onLogin(res.data.token)
    } catch (err) {
      const message = err.response?.data?.error || "Login failed"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", background: "#f0f0f0", marginBottom: "20px" }}>
      <h3>Admin Login</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <input 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", cursor: "pointer" }} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </form>
      {error && <p style={{color: "red" }}>{error}</p>}
    </div>
  )
}

export default Login
