import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import FitnessPage from './pages/FitnessPage';
import TrackingPage from './pages/TrackingPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/fitness" element={<FitnessPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
