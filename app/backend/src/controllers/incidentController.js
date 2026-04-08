const incidentService = require('../services/incidentService');

const list = async (req, res, next) => {
  try {
    const { status, severity, search } = req.query;
    const incidents = await incidentService.list({ status, severity, search });
    res.json(incidents);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, description, severity } = req.body;

    if (!title || !description || !severity) {
      return res.status(400).json({ error: 'Title, description, and severity are required' });
    }

    const validSeverities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validSeverities.includes(severity)) {
      return res.status(400).json({ error: `Severity must be one of: ${validSeverities.join(', ')}` });
    }

    const incident = await incidentService.create({
      title,
      description,
      severity,
      reportedById: req.user.id,
    });
    res.status(201).json(incident);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const incident = await incidentService.getById(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { status, severity, title, description } = req.body;
    const incident = await incidentService.update(req.params.id, { status, severity, title, description });
    res.json(incident);
  } catch (error) {
    next(error);
  }
};

const stats = async (_req, res, next) => {
  try {
    const statistics = await incidentService.getStats();
    res.json(statistics);
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create, getById, update, stats };
