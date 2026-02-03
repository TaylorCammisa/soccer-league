import { useState } from 'react'

function Login({ onLogin }) {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault() //Prevents Page Reloads

    //Hardcoded Password for testing
    if (password === "admin123") {
      onLogin(true)
      setError("")
    } else {
      setError("Wrong password!")
    }
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", background: "#f0f0f0", marginBottom: "20px" }}>
      <h3>Admin Login</h3>
      <form onSubmit={handleSubmit}>
        <input 
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "8px 15px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      {error && <p style={{color: "red" }}>{error}</p>}
    </div>
  )
}

export default Login