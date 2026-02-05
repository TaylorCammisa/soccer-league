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

// Add a new team
app.post('/api/teams', async (req, res) => {
    try {
        const { name } = req.body;
        const result = await pool.query('INSERT INTO teams (name, stats) VALUES ($1, $2) RETURNING *', [name, '{}']);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a team
app.delete('/api/teams/:id' , async (req, res) => {
    try {
        const { id } =req.params;
        await pool.query('DELETE FROM teams WHERE id = $1', [id]);
        res.json({ message: 'Team deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/players/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const result = await SecurityPolicyViolationEvent.query('SELECT * FROM players WHERE team_id = $1', [teamId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const { name, team_id } = req.body;
    const result = await pool.query('INSERT INTO players (name, team_id) VALUES ($1, $2) RETURNING *', [name, team_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.staus(500).json({ error: 'Server error' });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM players WHERE id = $1', [id]);
    res.json({ message: 'Player Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/teams', async (req, res) => {
    try {
        const teamsResult = await db.query('SELECT * FROM teams');
        const matchesResult = await db.query('SELECT * FROM matches WHERE is_finished = TRUE');

        let teams = teamsResult.rows;
        const matches = matchesResult.rows;

        teams = teams.map(team => ({
            ...team,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            goals_for: 0,
            goals_against: 0
        }));

        matches.forEach(match => {
            const homeTeam = teams.find(t => t.name === match.home_team);
            const awayTeam = teams.find(t => t.name === match.away_team);

            if (homeTeam && awayTeam) {
                homeTeam.goals_for += match.home_score;
                homeTeam.goals_against += match.away_score;
                awayTeam.goals_for += match.away_score;
                awayTeam.goals_against += match.home_score;

                if (match.home_score > match.away_score) {
                    homeTeam.wins += 1;
                    homeTeam.points += 3;
                    awayTeam.losses += 1;
                } else if (match.away_score > match.home_score) {
                    awayTeam.wins += 1;
                    awayTeam.points += 3;
                    homeTeam.losses += 1;
                } else {
                    homeTeam.draws += 1;
                    homeTeam.points += 1;
                    awayTeam.draws += 1;
                    awayTeam.points += 1;
                }

            }
        });

        teams.sort((a, b) => b.points - a.points);

        res.json(teams);
        
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});

app.get('/api/matches', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM matches ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

app.put('/api/matches/:id', async (req, res) => {
  const { id } = req.params; 
  const { homeScore, awayScore } = req.body; 

  try {
    const query = `
      UPDATE matches 
      SET home_score = $1, away_score = $2, is_finished = TRUE 
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});