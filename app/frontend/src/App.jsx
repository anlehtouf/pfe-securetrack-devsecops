import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import IncidentList from './components/IncidentList';
import IncidentDetail from './components/IncidentDetail';
import IncidentForm from './components/IncidentForm';
import Navbar from './components/Navbar';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const token = localStorage.getItem('token');

  return (
    <div className="app">
      {token && <Navbar />}
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/incidents" element={<PrivateRoute><IncidentList /></PrivateRoute>} />
          <Route path="/incidents/new" element={<PrivateRoute><IncidentForm /></PrivateRoute>} />
          <Route path="/incidents/:id" element={<PrivateRoute><IncidentDetail /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
