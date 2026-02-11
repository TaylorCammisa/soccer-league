const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const db = require('./db'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_SECRET = process.env.AUTH_SECRET || ADMIN_API_KEY || 'dev-change-me';
const TOKEN_TTL_MS = Number(process.env.AUTH_TOKEN_TTL_MS || 1000 * 60 * 60 * 12);
const AUTH_ENABLED = Boolean(ADMIN_API_KEY || ADMIN_PASSWORD);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    }
  })
);
app.use(express.json());

const toBase64Url = (value) => Buffer.from(value).toString('base64url');
const signToken = (payload) => {
  const body = toBase64Url(JSON.stringify(payload));
  const sig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(body)
    .digest('base64url');
  return `${body}.${sig}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes('.')) return null;
  const [body, providedSig] = token.split('.');
  if (!body || !providedSig) return null;

  const expectedSig = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(body)
    .digest('base64url');

  if (providedSig.length !== expectedSig.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) {
    return null;
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || Date.now() > payload.exp) return null;
  return payload;
};

const requireAdmin = (req, res, next) => {
  if (!AUTH_ENABLED) {
    next();
    return;
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const validSignedToken = verifyToken(token);
  const validApiKey = ADMIN_API_KEY && token === ADMIN_API_KEY;

  if (!validSignedToken && !validApiKey) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
};

const normalizeDivision = (value) => {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim().toLowerCase();
  if (raw === '1' || raw === 'division 1' || raw === 'd1') return 'Division 1';
  if (raw === '2' || raw === 'division 2' || raw === 'd2') return 'Division 2';
  return String(value).trim();
};

app.get('/', (req, res) => {
  res.send('Server is working!');
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!AUTH_ENABLED) {
    res.status(400).json({ error: 'Auth is not configured on the server' });
    return;
  }

  const expectedPassword = ADMIN_PASSWORD || ADMIN_API_KEY;
  if (!expectedPassword) {
    res.status(500).json({ error: 'Auth configuration is incomplete' });
    return;
  }

  if (username !== ADMIN_USERNAME || password !== expectedPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const exp = Date.now() + TOKEN_TTL_MS;
  const token = signToken({ sub: ADMIN_USERNAME, exp });
  res.json({
    token,
    username: ADMIN_USERNAME,
    expiresAt: new Date(exp).toISOString()
  });
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

app.post('/api/teams', requireAdmin, async (req, res) => {
    try {
        const { name, division } = req.body;
        if (!name || !division) {
          res.status(400).json({ error: 'Missing required fields: name, division' });
          return;
        }
        const result = await db.query('INSERT INTO teams (name, division) VALUES ($1, $2) RETURNING *', [name, division]);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/teams/:id', requireAdmin, async (req, res) => {
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

app.post('/api/players', requireAdmin, async (req, res) => {
  try {
    const { name, team_id } = req.body;
    if (!name || !team_id) {
      res.status(400).json({ error: 'Missing required fields: name, team_id' });
      return;
    }
    const result = await db.query('INSERT INTO players (name, team_id) VALUES ($1, $2) RETURNING *', [name, team_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/players/:id', requireAdmin, async (req, res) => {
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
app.post('/api/matches', requireAdmin, async (req, res) => {
    try {
        // We receive IDs (team1_id), so we save IDs.
        const { team1_id, team2_id, date, acknowledge_division_mismatch } = req.body;
        if (!team1_id || !team2_id || !date) {
          res.status(400).json({ error: 'Missing required fields: team1_id, team2_id, date' });
          return;
        }
        if (team1_id === team2_id) {
          res.status(400).json({ error: 'Home and away teams must be different' });
          return;
        }

        const teamsResult = await db.query(
          'SELECT id, division FROM teams WHERE id = ANY($1::int[])',
          [[Number(team1_id), Number(team2_id)]]
        );
        if (teamsResult.rows.length !== 2) {
          res.status(400).json({ error: 'One or both selected teams do not exist' });
          return;
        }

        const homeTeam = teamsResult.rows.find(team => Number(team.id) === Number(team1_id));
        const awayTeam = teamsResult.rows.find(team => Number(team.id) === Number(team2_id));
        const homeDivision = normalizeDivision(homeTeam?.division);
        const awayDivision = normalizeDivision(awayTeam?.division);
        const isCrossDivision = homeDivision && awayDivision && homeDivision !== awayDivision;

        if (isCrossDivision && acknowledge_division_mismatch !== true) {
          res.status(400).json({
            error: 'Cross-division match requires explicit acknowledgement',
            requiresAcknowledgement: true
          });
          return;
        }

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
app.put('/api/matches/:id', requireAdmin, async (req, res) => {
  const { id } = req.params; 
  const { homeScore, awayScore } = req.body; 

  try {
    if (homeScore === undefined || awayScore === undefined) {
      res.status(400).json({ error: 'Missing required fields: homeScore, awayScore' });
      return;
    }

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

app.delete('/api/matches/:id', requireAdmin, async (req, res) => {
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
