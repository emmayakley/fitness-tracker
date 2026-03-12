import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
//import { l } from 'react-router/dist/development/index-react-server-client-C4tCIird';

function ActiveWorkout() {
  const { id, dayId } = useParams();
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [logs, setLogs] = useState({});
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    initializeWorkout();
  }, []);

  const initializeWorkout = async () => {
    try {
      //create a workout session
      const today = new Date().toISOString().split('T')[0];
      const sessionRes = await fetch(
        'http://localhost:3001/api/workoutsession',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today, notes: '' }),
        }
      );
      const sessionData = await sessionRes.json();
      console.log('Created session:', sessionData);
      setSessionId(sessionData.id);

      //fetch exercises
      const slotsRes = await fetch(
        `http://localhost:3001/api/days/${dayId}/slots`
      );
      const slotsData = await slotsRes.json();

      //get exercise names
      const exercisesWithNames = await Promise.all(
        slotsData.results
          .filter((slot) => slot !== null)
          .map(async (slot) => {
            const entriesRes = await fetch(
              `http://localhost:3001/api/slots/${slot.id}/entries`
            );
            const entriesData = await entriesRes.json();
            if (entriesData.results.length === 0) return null;

            const entry = entriesData.results[0];
            const exerciseRes = await fetch(
              `http://localhost:3001/api/exercises/${entry.exercise}`
            );
            const exerciseData = await exerciseRes.json();
            const englishTranslation = exerciseData.translations?.find(
              (t) => t.language === 2
            );
            const name =
              englishTranslation?.name ||
              exerciseData.translations?.[0]?.name ||
              `Exercise ${entry.exercise}`;

            return { id: entry.exercise, name, slotId: slot.id };
          })
      );

      const filtered = exercisesWithNames.filter((e) => e !== null);
      setExercises(filtered);

      //initialize empty logs
      const initialLogs = {};
      filtered.forEach((exercise) => {
        initialLogs[exercise.id] = [{ reps: '', weight: '' }];
      });
      setLogs(initialLogs);
      setLoading(false);
    } catch (error) {
      console.error('Errir initialzing workout:', error);
      setLoading(false);
    }
  };

  const addSet = (exerciseId) => {
    setLogs((prev) => ({
      ...prev,
      [exerciseId]: [...prev[exerciseId], { reps: '', weight: '' }],
    }));
  };

  const updateSet = (exerciseId, setIndex, field, value) => {
    setLogs((prev) => {
      const updatedSets = [...prev[exerciseId]];
      updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  const removeSet = (exerciseId, setIndex) => {
    setLogs((prev) => {
      const updatedSets = prev[exerciseId].filter((_, i) => i !== setIndex);
      return { ...prev, [exerciseId]: updatedSets };
    });
  };

  const finishWorkout = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // log each set for each exercise
      for (const exercise of exercises) {
        const sets = logs[exercise.id];
        for (const set of sets) {
          if (!set.reps || !set.weight) continue; // skip empty sets
          await fetch('http://localhost:3001/api/workoutlog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              exercise: exercise.id,
              sets: 1,
              reps: parseInt(set.reps),
              weight: parseFloat(set.weight),
              workoutsession: sessionId,
            }),
          });
        }
      }

      setFinished(true);
    } catch (error) {
      console.error('Error finishing workout:', error);
    }
  };
  if (loading) return <p>Loading workout...</p>;

  if (finished) {
    return (
      <div className="text-center mt-5">
        <h2>Workout Complete! 🎉</h2>
        <p className="text-muted">Great work today!</p>
        <button
          className="btn btn-dark mt-3"
          onClick={() => navigate(`/fitness/${id}`)}
        >
          Back to Routine
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-dark me-3"
          onClick={() => navigate(`/fitness/${id}`)}
        >
          ← Back
        </button>
        <h1 className="mb-0">Active Workout</h1>
      </div>

      {/* Exercises */}
      {exercises.map((exercise) => (
        <div key={exercise.id} className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">{exercise.name}</h5>

            {/* Set headers */}
            <div
              className="row mb-2 text-muted"
              style={{ fontSize: '0.85rem' }}
            >
              <div className="col-2">Set</div>
              <div className="col-4">Reps</div>
              <div className="col-4">Weight (lbs)</div>
              <div className="col-2"></div>
            </div>

            {/* Sets */}
            {logs[exercise.id]?.map((set, setIndex) => (
              <div key={setIndex} className="row mb-2 align-items-center">
                <div className="col-2">{setIndex + 1}</div>
                <div className="col-4">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Reps"
                    value={set.reps}
                    onChange={(e) =>
                      updateSet(exercise.id, setIndex, 'reps', e.target.value)
                    }
                  />
                </div>
                <div className="col-4">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Weight"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(exercise.id, setIndex, 'weight', e.target.value)
                    }
                  />
                </div>
                <div className="col-2">
                  {logs[exercise.id].length > 1 && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeSet(exercise.id, setIndex)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              className="btn btn-outline-dark btn-sm mt-2"
              onClick={() => addSet(exercise.id)}
            >
              + Add Set
            </button>
          </div>
        </div>
      ))}

      {/* Finish Button */}
      <button
        className="btn btn-success btn-lg w-100 mb-5"
        onClick={finishWorkout}
      >
        Finish Workout 🎉
      </button>
    </div>
  );
}

export default ActiveWorkout;
