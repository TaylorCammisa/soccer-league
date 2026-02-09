import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import StandingsPage from './pages/StandingsPage';
import RosterPage from './pages/RosterPage';
import Manager from './Manager';

function App() {
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
                        Manager Login
                    </Link>
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/standings" element={<StandingsPage />} />
                <Route path="/roster" element={<RosterPage />} />
                <Route path="/manager" element={<Manager />} />
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