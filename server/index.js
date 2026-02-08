const express = require('express');
const cors = require('cors');
const db = require('./db'); 
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is working!');
});

// --- TEAMS ---

// Get ALL Teams (Simplified: No complex math here anymore)
app.get('/api/teams', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM teams');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});

app.post('/api/teams', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await db.query('INSERT INTO teams (name) VALUES ($1) RETURNING *', [name]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/teams/:id' , async (req, res) => {
    try {
        const { id } =req.params;
        await db.query('DELETE FROM teams WHERE id = $1', [id]);
        res.json({ message: 'Team deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// --- PLAYERS ---
app.get('/api/players', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM players');
        res.json(result.rows);
    }   catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/players/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const result = await db.query('SELECT * FROM players WHERE team_id = $1', [teamId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const { name, team_id } = req.body;
    const result = await db.query('INSERT INTO players (name, team_id) VALUES ($1, $2) RETURNING *', [name, team_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM players WHERE id = $1', [id]);
    res.json({ message: 'Player Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- MATCHES ---
app.get('/api/matches', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM matches ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

// Create Match
app.post('/api/matches', async (req, res) => {
    try {
        // We receive IDs (team1_id), so we save IDs.
        const { team1_id, team2_id, date } = req.body;
        const result = await db.query(
            `INSERT INTO matches (home_team, away_team, date, home_score, away_score, status)
            VALUES ($1, $2, $3, 0, 0, 'scheduled')
            RETURNING *`,
            [team1_id, team2_id, date]
        );
        res.json(result.rows[0]);
    }   catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

// Update Match Score
app.put('/api/matches/:id', async (req, res) => {
  const { id } = req.params; 
  const { homeScore, awayScore } = req.body; 

  try {
    // We update the score AND mark it as completed
    const query = `
      UPDATE matches 
      SET home_score = $1, away_score = $2, status = 'completed' 
      WHERE id = $3
      RETURNING *;
    `;
    const result = await db.query(query, [homeScore, awayScore, id]);
    res.json(result.rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

app.delete('/api/matches/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM matches WHERE id = $1', [id]);
        res.json({ message: 'Match deleted' });
    }   catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});