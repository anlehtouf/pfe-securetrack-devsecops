import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { incidentApi } from '../services/api';

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentApi.list()
      .then((res) => setIncidents(res.data))
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading incidents...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Incidents</h1>
        <Link to="/incidents/new" className="btn">+ New Incident</Link>
      </div>
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported By</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((inc) => (
              <tr key={inc.id}>
                <td>{inc.title}</td>
                <td className={`severity-${inc.severity}`}>{inc.severity}</td>
                <td className={`status-${inc.status}`}>{inc.status}</td>
                <td>{inc.reportedBy?.name || 'Unknown'}</td>
                <td>{new Date(inc.createdAt).toLocaleDateString()}</td>
                <td><Link to={`/incidents/${inc.id}`}>View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {incidents.length === 0 && <p style={{ textAlign: 'center', marginTop: '1rem' }}>No incidents found</p>}
      </div>
    </div>
  );
}

export default IncidentList;
