const express = require('express');
const cors = require('cors');
const db = require('./db'); 
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ROUTE 1: Home Test
app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.get('/api/teams', async (req, res) => {
    try {
        const teamsResult = await db.query('SELECT * FROM teams');
        const matchesResult = await db.query('SELECT * FROM matches WHERE is_finished = TRUE');

        let teams = teamsResult.rows;
        const matches = matchesResult.rows;

        team = teams.map(team => ({
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

// ROUTE 3: Get Matches (This is the one you were missing)
app.get('/api/matches', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM matches ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

// ROUTE 4: Update Match Score (For the Save button)
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