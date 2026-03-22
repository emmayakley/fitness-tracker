require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://fitness-tracker-tpxy.vercel.app',
    ],
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

const BASE_URL = 'https://wger.de/api/v2';

// anonymous function to return the header as an object
// this way we don't need to write a new header for every call to the API
const getHeaders = () => ({
  Authorization: `Token ${process.env.WGER_TOKEN}`,
  'Content-Type': 'application/json',
});

///////////////////////////////////////////////////////////////////////////////////////
//Routine routes
///////////////////////////////////////////////////////////////////////////////////////

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
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error creating routine:',
      error.response?.data || error.message,
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

///////////////////////////////////////////////////////////////////////////////////////
//Routine Details routes
///////////////////////////////////////////////////////////////////////////////////////

//GET a routine
app.get('/api/routines/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/routine/${id}/`, {
      headers: getHeaders(),
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching routine:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//GET exercises for a routine
app.get('/api/routines/:id/days', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/day/`, {
      headers: getHeaders(),
      params: { routine: id },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching days:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//POST create a day in a routine
//wger API structure requires a day defined to access exercises
app.post('/api/routines/:id/days', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const response = await axios.post(
      `${BASE_URL}/day/`,
      {
        name,
        routine: id,
      },
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error creating routine:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//GET slots for a day
app.get('/api/days/:dayId/slots', async (req, res) => {
  try {
    const { dayId } = req.params;
    const response = await axios.get(`${BASE_URL}/slot/`, {
      headers: getHeaders(),
      params: { day: dayId },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching slots:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//POST create a slot in a day
app.post('/api/days/:dayId/slots', async (req, res) => {
  try {
    const { dayId } = req.params;

    const response = await axios.post(
      `${BASE_URL}/slot/`,
      {
        day: dayId,
      },
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error creating routine:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//POST add exercise to slot
app.post('/api/slots/:slotId/exercises', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { exerciseId } = req.body;

    const response = await axios.post(
      `${BASE_URL}/slot-entry/`,
      {
        slot: slotId,
        exercise: exerciseId,
      },
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error creating routine:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//GET exercises list for searching
app.get('/api/exercises/search', async (req, res) => {
  try {
    const { term } = req.query;
    const response = await axios.get(`${BASE_URL}/exercise/search/`, {
      headers: getHeaders(),
      params: { term, language: 'english', format: 'json' },
    });
    //Debugging: delete later
    console.log(
      'Search results:',
      JSON.stringify(response.data.suggestions[0]),
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching slots:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// GET entries for a slot
app.get('/api/slots/:slotId/entries', async (req, res) => {
  try {
    const { slotId } = req.params;
    const response = await axios.get(`${BASE_URL}/slot-entry/`, {
      headers: getHeaders(),
      params: { slot: slotId },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching slot entries:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//DELETE a day
app.delete('/api/days/:dayId', async (req, res) => {
  try {
    const { dayId } = req.params;
    await axios.delete(`${BASE_URL}/day/${dayId}/`, {
      headers: getHeaders(),
    });
    res.json({ message: 'Day deleted successfully' });
  } catch (error) {
    console.error('Error deleting routine:', error.response);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.get('/api/exercises/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${BASE_URL}/exerciseinfo/${id}/`, {
      headers: getHeaders(),
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching slots:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//====================Workout session=====================

//POST create a workout session
app.post('/api/workoutsession', async (req, res) => {
  try {
    const { date, notes } = req.body;

    const response = await axios.post(
      `${BASE_URL}/workoutsession/`,
      {
        date,
        notes,
        impression: '3',
      },
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error creating workout session:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//POST log a weight entry
app.post('/api/weightentry', async (req, res) => {
  try {
    const { date, weight } = req.body;

    const response = await axios.post(
      `${BASE_URL}/weightentry/`,
      {
        date,
        weight,
      },
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error logging weight entry:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//POST log exercise sets (aka reps and weight for an exercise)
app.post('/api/workoutlog', async (req, res) => {
  try {
    const { exercise, sets, reps, weight, workoutsession } = req.body;

    const response = await axios.post(
      `${BASE_URL}/workoutlog/`,
      {
        exercise,
        sets,
        reps,
        weight,
        workoutsession,
      },
      { headers: getHeaders() },
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error logging workout:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//====================Tracking Page=====================

//GET all of the workout logs
app.get('/api/workoutlogs', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/workoutlog/`, {
      headers: getHeaders(),
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching workout logs:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//GET workout logs for a specific exercise
app.get('/api/workoutlogs/exercise/:exerciseId', async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const response = await axios.get(`${BASE_URL}/workoutlog/`, {
      headers: getHeaders(),
      params: { exercise: exerciseId },
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching exercise logs:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//GET inspirational quote for homepage from zen pages API
app.get('/api/quote', async (req, res) => {
  try {
    const response = await axios.get('https://zenquotes.io/api/today');
    res.json(response.data[0]);
  } catch (error) {
    console.error(
      'Error fetching inspirational quote:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

//GET recent workout sessions
app.get('/api/workoutsessions', async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/workoutsession/`, {
      headers: getHeaders(),
    });
    res.json(response.data);
  } catch (error) {
    console.error(
      'Error fetching workout sessions:',
      error.response?.data || error.message,
    );
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
