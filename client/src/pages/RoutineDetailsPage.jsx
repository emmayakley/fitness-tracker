import { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function RoutineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedDayId, setSelectedDayId] = useState(null);

  useEffect(() => {
    fetchRoutineDetails();
  }, []);

  const fetchRoutineDetails = async () => {
    try {
      //get routine info
      const routinesRes = await fetch(
        `http://localhost:3001/api/routines/${id}`
      );
      const routineData = await routinesRes.json();
      setRoutine(routineData);

      //get the days for a routine
      const daysRes = await fetch(
        `http://localhost:3001/api/routines/${id}/days`
      );
      const daysData = await daysRes.json();

      const daysWithExercises = await Promise.all(
        daysData.results.map(async (day) => {
          const slotsRes = await fetch(
            `http://localhost:3001/api/days/${day.id}/slots`
          );
          const slotsData = await slotsRes.json();

          //get entries for each slot
          const slotsWithEntries = await Promise.all(
            slotsData.results.map(async (slot) => {
              const entriesRes = await fetch(
                `http://localhost:3001/api/slots/${slot.id}/entries`
              );
              const entriesData = await entriesRes.json();

              const entriesWithNames = await Promise.all(
                entriesData.results.map(async (entry) => {
                  const name = await fetchExerciseName(entry.exercise);
                  return { ...entry, exerciseName: name };
                })
              );
              return { ...slot, entries: entriesWithNames };
            })
          );
          return { ...day, slots: slotsWithEntries };
        })
      );
      setDays(daysWithExercises);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching routine details:', error);
      setLoading(false);
    }
  };

  const addDay = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/routines/${id}/days`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'New Day' }),
        }
      );
      const data = await response.json();
      await fetchRoutineDetails();
      setSelectedDayId(data.id);
    } catch (error) {
      console.error('Error adding day:', error);
    }
  };

  const searchExercises = async (term) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3001/api/exercises/search?term=${term}`
      );
      const data = await response.json();
      setSearchResults(data.suggestions || []);
    } catch (error) {
      console.error('Error searching exercises:', error);
    }
  };

  const addExercise = async (exerciseId) => {
    if (!selectedDayId) {
      alert('Please select a day first');
      return;
    }
    try {
      //debugging:
      console.log('Adding exercise:', exerciseId, 'to day:', selectedDayId);
      //create a slot in the day
      const slotRes = await fetch(
        `http://localhost:3001/api/days/${selectedDayId}/slots`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const slotData = await slotRes.json();
      console.log('Created slot:', slotData);

      //add exercise to the slot
      const exerciseRes = await fetch(
        `http://localhost:3001/api/slots/${slotData.id}/exercises`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exerciseId }),
        }
      );
      const exerciseData = await exerciseRes.json();
      console.log('Added exercise:', exerciseData);

      setSearchTerm('');
      setSearchResults([]);
      await fetchRoutineDetails();
    } catch (error) {
      console.error('Error adding exercise:', error);
    }
  };

  const deleteDay = async (dayId) => {
    try {
      await fetch(`http://localhost:3001/api/days/${dayId}`, {
        method: 'DELETE',
      });
      await fetchRoutineDetails();
    } catch (error) {
      console.error('Error deleting day:', error);
    }
  };

  const fetchExerciseName = async (exerciseId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/exercises/${exerciseId}`
      );
      const data = await response.json();
      //wger API translates the information, english is labeled as translation #2
      const englishTranslation = data.translations?.find(
        (t) => t.language === 2
      );
      return englishTranslation?.name || `Exercise ${exerciseId}`;
    } catch (error) {
      console.error('Error fetching exercise name:', error);
      return `Exercise ${exerciseId}`;
    }
  };

  if (loading) return <p>Loading routine...</p>;

  return (
    <div>
      {/*Header*/}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn btn-outline-dark me-3"
          onClick={() => navigate('/fitness')}
        >
          ← Back
        </button>
        <h1 className="mb-0">{routine?.name}</h1>
      </div>

      {/*Days and Exercises*/}
      <div className="row">
        <div className="col-md-8">
          {days.length === 0 ? (
            <p>No days yet. Add a day to get started!</p>
          ) : (
            days.map((day) => (
              <div
                key={day.id}
                className={`card mb-3 ${
                  selectedDayId === day.id ? 'border-dark' : ''
                }`}
                onClick={() => setSelectedDayId(day.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body">
                  <h5 className="card-title">{day.name}</h5>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {selectedDayId === day.id
                      ? '✓ Selected — add exercises below'
                      : 'Click to select'}
                  </p>
                  <button
                    className="btn btn-danger btn-sm mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDay(day.id);
                    }}
                  >
                    Delete Day
                  </button>
                  {/* Display exercises */}
                  {day.slots && day.slots.length > 0 && (
                    <ul className="list-group mt-2">
                      {day.slots
                        .filter((slot) => slot.entries?.length > 0)
                        .map((slot) => (
                          <li key={slot.id} className="list-group-item">
                            {slot.entries[0]?.exerciseName ||
                              `Exercise ${slot.entries[0]?.exercise}`}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
          <button className="btn btn-dark" onClick={addDay}>
            + Add Day
          </button>
        </div>

        {/*Add Exercise Panel*/}
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Add Exercise</h5>
            {!selectedDayId ? (
              <p className="text-muted">Select a day on the left first</p>
            ) : (
              <>
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => searchExercises(e.target.value)}
                />
                {searchResults.length > 0 && (
                  <ul className="list-group">
                    {searchResults.map((exercise) => (
                      <li
                        key={exercise.data.base_id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => addExercise(exercise.data.base_id)}
                      >
                        {exercise.value}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoutineDetail;
