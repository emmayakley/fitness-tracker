import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FitnessPage from './pages/FitnessPage';
import TrackingPage from './pages/TrackingPage';
import RoutineDetail from './pages/RoutineDetailsPage';
import ActiveWorkout from './pages/ActiveWorkoutPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/fitness/:id" element={<RoutineDetail />} />
          <Route path="/fitness/:id/workout/:dayId" element={<ActiveWorkout />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
