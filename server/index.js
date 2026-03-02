require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = 'https://wger.de/api/v2';

// anonymous function to return the header as an object
// this way we don't need to write a new header for every call to the API
const getHeaders = () => ({
  Authorization: `Token ${process.env.WGER_TOKEN}`,
  'Content-Type': 'application/json',
});

// GET all exercises
app.get('/api/exercises', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/exercise/`, {
      headers: getHeaders(),
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching exercises:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET all routines
app.get('/api/routines', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/routine/`, {
      headers: getHeaders(),
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching routines:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST create a new routine
app.post('/api/routines', async (req, res) => {
  try {
    const { name, description } = req.body;
    const response = await axios.post(
      `${BASE_URL}/routine/`,
      { name, description },
      { headers: getHeaders() }
    );
  } catch (error) {
    console.error('Error creating routine:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
