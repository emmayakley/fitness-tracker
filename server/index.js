require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/exercises', async (req, res) => {
  try {
    const response = await axios.get('https://wger.de/api/v2/exercise/', {
      headers: { Authorization: `Token ${process.env.WGER_TOKEN}` },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
