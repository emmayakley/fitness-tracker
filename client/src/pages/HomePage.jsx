import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quoteRes, sessionRes] = await Promise.all([
        fetch('http://localhost:3001/api/quote'),
        fetch('http://localhost:3001/api/workoutsessions'),
      ]);

      const quoteData = await quoteRes.json();
      const sessionsData = await sessionRes.json();

      setQuote(quoteData);

      //count workouts for the current year
      const currentYear = new Date().getFullYear();
      const numWorkoutsForYear = sessionsData.results.filter((session) => {
        const sessionYear = new Date(session.date).getFullYear();
        console.log(
          'Session date:',
          session.date,
          'Year:',
          sessionYear,
          'Current year:',
          currentYear,
        );
        return sessionYear === currentYear;
      });
      setWorkoutCount(numWorkoutsForYear.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center text-center"
      style={{ minHeight: '80vh' }}
    >
      {/* Inspirational Quote */}
      {quote && (
        <div className="mb-5" style={{ maxWidth: '700px' }}>
          <h1 className="display-5 fst-italic mb-3">"{quote.q}"</h1>
          <p className="text-muted fs-5">— {quote.a}</p>
        </div>
      )}

      {/* Workout Count Message */}
      <div className="mb-4" style={{ maxWidth: '600px' }}>
        <h4 className="mb-4">
          You've already worked out{' '}
          <span className="fw-bold">{workoutCount}</span>{' '}
          {workoutCount === 1 ? 'time' : 'times'} this year.
          <br />
          Make today <span className="fw-bold">#{workoutCount + 1}</span>!
        </h4>
        <button
          className="btn btn-dark btn-lg px-5 py-3"
          onClick={() => navigate('/fitness')}
        >
          Start a Workout
        </button>
      </div>
    </div>
  );
}

export default HomePage;
