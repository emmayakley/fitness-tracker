import { useState, useEffect } from 'react';

function FitnessPage() {
  const [routines, setRoutines] = useState([]);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/routines');
      const data = await response.json();

      // wger routines are stored in results
      setRoutines(data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching routines:', error);
      setLoading(false);
    }
  };

  const createRoutine = async () => {
    if (!newRoutineName) return;
    try {
      await fetch('http://localhost:3001/api/routines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRoutineName }),
      });
      setNewRoutineName('');
      fetchRoutines();
    } catch (error) {
      console.error('Error creating routine:', error);
    }
  };

  if (loading) return <p>Loading Routines...</p>;

  return (
    <div>
      <h1 className="mb-4">My Routines</h1>

      <div className="row mb-4">
        {routines.length === 0 ? (
          <p>No routines yet. Create one below!</p>
        ) : (
          routines.map((routine) => (
            <div key={routine.id} className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{routine.name}</h5>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card p-3">
        <h5>Create New Routine</h5>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder='"Routine Name (i.e. Push Day)'
            value={newRoutineName}
            onChange={(e) => setNewRoutineName(e.target.value)}
          />
          <button className="btn btn-dark" onClick={createRoutine}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default FitnessPage;
