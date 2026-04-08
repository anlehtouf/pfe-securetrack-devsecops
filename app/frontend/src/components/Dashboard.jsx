import { useEffect, useState } from 'react';
import { incidentApi } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentApi.stats()
      .then((res) => setStats(res.data))
      .catch(() => setStats({ total: 0, bySeverity: {}, byStatus: {} }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="card">
          <h3>Total Incidents</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div className="card">
          <h3>By Severity</h3>
          {Object.entries(stats.bySeverity || {}).map(([key, val]) => (
            <p key={key} className={`severity-${key}`}>{key}: {val}</p>
          ))}
        </div>
        <div className="card">
          <h3>By Status</h3>
          {Object.entries(stats.byStatus || {}).map(([key, val]) => (
            <p key={key} className={`status-${key}`}>{key}: {val}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
