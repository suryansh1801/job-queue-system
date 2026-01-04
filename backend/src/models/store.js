const Queue = require('../lib/Queue');

const jobs = new Map();
const queue = new Queue();

module.exports = {
  create: (job) => {
    jobs.set(job.jobId, job);
    queue.enqueue(job.jobId); // Use enqueue
    return job;
  },

  findById: (id) => jobs.get(id),

  findAll: () => Array.from(jobs.values()),

  dequeue: () => queue.dequeue(), // Use dequeue

  requeue: (id) => queue.enqueue(id)
};