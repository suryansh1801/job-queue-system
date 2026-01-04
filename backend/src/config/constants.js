module.exports = {
  JOB_STATUS: {
    QUEUED: 'QUEUED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  },
  CONFIG: {
    CONCURRENCY: parseInt(process.env.CONCURRENCY) || 3,
    MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 2,
    POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS) || 1000,
    WORK_SIMULATION_MS: parseInt(process.env.WORK_SIMULATION_MS) || 3000
  }
};