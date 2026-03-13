import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function TrackingPage() {
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [consistencyData, setConsistencyData] = useState([]);
  const [exerciseLogs, setExerciseLogs] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkoutLogs();
  }, []);

  const fetchWorkoutLogs = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/workoutlogs');
      const data = await response.json();
      console.log('Workout logs:', JSON.stringify(data));
      setWorkoutLogs(data.results);

      //consistency data
      const workoutsByDate = {};
      data.results.forEach((log) => {
        const date = log.date.split('T')[0];
        workoutsByDate[date] = (workoutsByDate[date] || 0) + 1;
      });

      const consistency = Object.entries(workoutsByDate).map(
        ([date, count]) => ({
          date,
          workouts: count,
        }),
      );
      setConsistencyData(consistency);

      //get unique exercises from logs
      const uniqueExerciseIds = [
        ...new Set(data.results.map((log) => log.exercise)),
      ];
      const exerciseNames = await Promise.all(
        uniqueExerciseIds.map(async (exerciseId) => {
          const res = await fetch(
            `http://localhost:3001/api/exercises/${exerciseId}`,
          );
          const exerciseData = await res.json();
          const englishTranslation = exerciseData.translations?.find(
            (t) => t.language === 2,
          );
          return {
            id: exerciseId,
            name: englishTranslation?.name || `Exercise ${exerciseId}`,
          };
        }),
      );
      setExercises(exerciseNames);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching workout logs:', error);
      setLoading(false);
    }
  };

  const fetchExerciseLogs = async (exerciseId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/workoutlogs/exercise/${exerciseId}`,
      );
      const data = await response.json();

      //format the data for the chart
      const chartData = data.results.map((log) => ({
        date: log.date.split('T')[0],
        weight: parseFloat(log.weight),
      }));
      setExerciseLogs(chartData);
    } catch (error) {
      console.error('Error fetching exercise logs:', error);
    }
  };

  const handleExerciseSelect = (e) => {
    const exerciseId = e.target.value;
    setSelectedExercise(exerciseId);
    if (exerciseId) fetchExerciseLogs(exerciseId);
  };

  if (loading) return <p>Loading tracking data...</p>;

  return (
    <div>
      <h1 className="mb-4">My Progress</h1>

      {/* Workout Consistency Chart */}
      <div className="card mb-4 p-3">
        <h5 className="mb-3">Workout Consistency</h5>
        {consistencyData.length === 0 ? (
          <p className="text-muted">
            No workout data yet. Complete a workout to see your consistency!
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={consistencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="workouts"
                stroke="#1a1a2e"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Exercise Progress Chart */}
      <div className="card p-3">
        <h5 className="mb-3">Exercise Progress</h5>
        <select
          className="form-select mb-3"
          value={selectedExercise}
          onChange={handleExerciseSelect}
        >
          <option value="">Select an exercise...</option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </select>

        {selectedExercise && exerciseLogs.length === 0 ? (
          <p className="text-muted">No logs found for this exercise.</p>
        ) : selectedExercise ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={exerciseLogs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#4a90d9"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-muted">
            Select an exercise above to see your progress over time.
          </p>
        )}
      </div>
    </div>
  );
}

export default TrackingPage;
