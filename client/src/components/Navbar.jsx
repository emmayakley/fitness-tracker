import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand" to="/">
        FitTracker
      </Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/fitness">
              Fitness
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/tracking">
              Tracking
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
