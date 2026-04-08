import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentApi } from '../services/api';

function IncidentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', severity: 'MEDIUM' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await incidentApi.create(form);
      navigate('/incidents');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create incident');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div className="card">
        <h2>Report New Incident</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea rows="5" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Severity</label>
            <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn">Submit</button>
        </form>
      </div>
    </div>
  );
}

export default IncidentForm;
