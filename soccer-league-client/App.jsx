import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import StandingsPage from './pages/StandingsPage';
import RosterPage from './pages/RosterPage';
import Manager from './Manager';
import Login from './components/Login';

const ADMIN_TOKEN_KEY = 'manager_auth_token';
const NAV_LOGO_SRC = './assets/StocktonSoccer.png';

function App() {
    const [adminToken, setAdminToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_KEY) || '');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogin = (token) => {
        setAdminToken(token);
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
    };

    const handleLogout = () => {
        setAdminToken('');
        localStorage.removeItem(ADMIN_TOKEN_KEY);
    };

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    useEffect(() => {
        if (!isMobileMenuOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.classList.add('mobile-menu-open');

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMobileMenuOpen]);

    return (
        <Router>
            {/* Main Nav Bar */}
            <nav className="main-nav">
                <button
                    type="button"
                    className="mobile-menu-toggle"
                    onClick={() => setIsMobileMenuOpen(true)}
                    aria-label="Open navigation menu"
                >
                    <span />
                    <span />
                    <span />
                </button>

                <Link to="/" className="nav-logo-link" onClick={closeMobileMenu} aria-label="Home">
                    <img src={NAV_LOGO_SRC} alt="Soccer League logo" className="nav-logo" />
                </Link>

                <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <div className="mobile-nav-header">
                        <span>Navigation</span>
                        <button
                            type="button"
                            className="mobile-menu-close"
                            onClick={closeMobileMenu}
                            aria-label="Close navigation menu"
                        >
                            ×
                        </button>
                    </div>
                    <Link to="/" style={navStyle} onClick={closeMobileMenu}>Matches (Home)</Link>
                    <Link to="/standings" style={navStyle} onClick={closeMobileMenu}>Standings</Link>
                    <Link to="/roster" style={navStyle} onClick={closeMobileMenu}>Rosters</Link>
                </div>

                <div className="admin-links">
                    <Link
                        to="/manager"
                        style={{ ...navStyle, color: '#e74c3c', border: '1px solid #e74c3c', padding: '5px 10px', borderRadius: '4px', marginRight: 0 }}
                        onClick={closeMobileMenu}
                    >
                        {adminToken ? 'Manager' : 'Manager Login'}
                    </Link>
                </div>
            </nav>

            {isMobileMenuOpen && <button type="button" aria-label="Close menu overlay" className="mobile-nav-overlay" onClick={closeMobileMenu} />}

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
