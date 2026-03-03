require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
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
      params: {
        is_public: false,
      },
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
    const { name } = req.body;

    const start = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 84); // 12 weeks from today
    const end = endDate.toISOString().split('T')[0];

    const response = await axios.post(
      `${BASE_URL}/routine/`,
      {
        name,
        description: '',
        start,
        end,
        is_public: false,
      },
      { headers: getHeaders() }
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error creating routine:',
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//DELETE delete a routine
app.delete('/api/routines/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await axios.delete(`${BASE_URL}/routine/${id}/`, {
      headers: getHeaders(),
    });
    res.json({ message: 'Routine deleted successfully' });
  } catch (error) {
    console.error('Error deleting routine:', error.response);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
