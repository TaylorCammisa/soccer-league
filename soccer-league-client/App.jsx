import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublicDashboard from './PublicDashboard';
import Manager from './Manager';

function App() {
    return (
        <Router>
            <nav style={{ padding: '10px', background: '#333', color: 'white', marginBottom: '20px' }}>
                <Link to="/" style= {{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Home</Link>
                <Link to="/manager" style={{ color: '#4CAF50', textDecoration: 'none', fontWeight: 'bold' }}>Manager Login</Link>
            </nav>

            <Routes>
                <Route path="/" element={<PublicDashboard />} />
                <Route path="/manager" element={<Manager />} />
            </Routes>
        </Router>
    );
}

export default App;