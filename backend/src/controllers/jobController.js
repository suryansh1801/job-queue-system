const { v4: uuidv4 } = require('uuid');
const store = require('../models/store');
const { JOB_STATUS } = require('../config/constants');

exports.submitJob = (req, res) => {
  const { type, payload } = req.body;

  if (!type || !payload) {
    return res.status(400).json({ error: "Missing 'type' or 'payload'" });
  }

  const job = {
    jobId: uuidv4(),
    type,
    payload,
    status: JOB_STATUS.QUEUED,
    retryCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    result: null
  };

  store.create(job);
  res.status(201).json({ jobId: job.jobId, status: job.status });
};

exports.getJob = (req, res) => {
  const job = store.findById(req.params.id);
  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }
  res.json(job);
};

exports.getAllJobs = (req, res) => {
  // Basic pagination & sorting
  const jobs = store.findAll().sort((a, b) => b.createdAt - a.createdAt);
  res.json({ count: jobs.length, jobs });
};