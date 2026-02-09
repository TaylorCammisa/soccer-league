import React from 'react';
import TeamCards from '../components/TeamCards';

function RosterPage() {
    return (
        <div className="page-container">
            <h2 style={{ textAlign: 'center' }}>Team Rosters</h2>
            <TeamCards />
        </div>
    );
}

export default RosterPage;