import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/"><strong>SecureTrack</strong></Link>
        <Link to="/incidents">Incidents</Link>
        <Link to="/incidents/new">New Incident</Link>
      </div>
      <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;
