import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { incidentApi } from '../services/api';

function IncidentDetail() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    incidentApi.get(id)
      .then((res) => setIncident(res.data))
      .catch(() => setIncident(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!incident) return <p>Incident not found</p>;

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await incidentApi.update(id, { status: newStatus });
      setIncident(res.data);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  return (
    <div>
      <div className="card">
        <h1>{incident.title}</h1>
        <p className={`severity-${incident.severity}`}>Severity: {incident.severity}</p>
        <p className={`status-${incident.status}`}>Status: {incident.status}</p>

        <h3 style={{ marginTop: '1rem' }}>Description</h3>
        <p>{incident.description}</p>

        <p style={{ marginTop: '1rem' }}>
          <strong>Reported by:</strong> {incident.reportedBy?.name} ({incident.reportedBy?.email})
        </p>
        <p><strong>Created:</strong> {new Date(incident.createdAt).toLocaleString()}</p>

        <div style={{ marginTop: '1rem' }}>
          <label>Update Status: </label>
          <select value={incident.status} onChange={(e) => handleStatusChange(e.target.value)}>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default IncidentDetail;
