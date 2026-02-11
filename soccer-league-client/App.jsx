import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import StandingsPage from './pages/StandingsPage';
import RosterPage from './pages/RosterPage';
import Manager from './Manager';
import Login from './components/Login';

const ADMIN_TOKEN_KEY = 'manager_auth_token';

function App() {
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');

    const handleLogin = (token) => {
        setAdminToken(token);
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    };

    const handleLogout = () => {
        setAdminToken('');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    };

    return (
        <Router>
            {/* Main Nav Bar */}
            <nav style={{
                padding: '15px',
                background: '#2c3e50',
                color: 'white',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div className="nav-links">
                    <Link to="/" style={navStyle}>Matches (Home)</Link>
                    <Link to="/standings" style={navStyle}>Standings</Link>
                    <Link to="/roster" style={navStyle}>Rosters</Link>
                </div>

                <div className="admin-links">
                    <Link to="/manager" style={{ ...navStyle, color: '#e74c3c', border: '1px solid #e74c3c', padding: '5px 10px', borderRadius: '4px', marginRight: 0}}>
                        {adminToken ? 'Manager' : 'Manager Login'}
                    </Link>
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/standings" element={<StandingsPage />} />
                <Route path="/roster" element={<RosterPage />} />
                <Route
                    path="/manager"
                    element={adminToken ? <Manager adminToken={adminToken} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />}
                />
            </Routes>
        </Router>
    );
}

// Simple style object for the links
const navStyle = {
    color: 'white',
    textDecoration: 'none',
    marginRight: '20px',
    fontSize: '1.1rem',
    fontWeight: 'bold'
};

export default App;
