const { Worker } = require('worker_threads');
const path = require('path');
const store = require('../models/store');
const { JOB_STATUS, CONFIG } = require('../config/constants');

const workers = []; 
const activeWorkers = new Map(); // Map<WorkerID, JobID>

const init = () => {
  console.log(`[Manager] Initializing ${CONFIG.CONCURRENCY} worker threads...`);
  
  for (let i = 0; i < CONFIG.CONCURRENCY; i++) {
    const worker = new Worker(path.join(__dirname, '../workers/jobProcessor.js'));
    
    worker.on('message', (message) => handleWorkerMessage(i, message));
    
    worker.on('error', (err) => console.error(`[Worker ${i}] Error:`, err));

    workers.push({ id: i, worker, busy: false });
  }

  startPolling();
};

const handleWorkerMessage = (workerId, message) => {
  const workerObj = workers.find(w => w.id === workerId);
  const jobId = activeWorkers.get(workerId);
  const job = store.findById(jobId);

  if (!job) return; // Should not happen

  if (message.success) {
    // Job Success
    console.log(`[Manager] Job ${jobId} Completed by Worker ${workerId}`);
    job.status = JOB_STATUS.COMPLETED;
    job.result = message.result;
  } else {
    // Job Failed
    console.error(`[Manager] Job ${jobId} Failed by Worker ${workerId}: ${message.error}`);
    if (job.retryCount < CONFIG.MAX_RETRIES) {
      job.retryCount++;
      job.status = JOB_STATUS.QUEUED;
      store.requeue(jobId); // Put back in queue
      console.log(`[Manager] Re-queueing Job ${jobId} (Attempt ${job.retryCount})`);
    } else {
      job.status = JOB_STATUS.FAILED;
      job.result = { error: message.error };
    }
  }

  job.updatedAt = new Date();
  
  // Mark worker as free
  workerObj.busy = false;
  activeWorkers.delete(workerId);
};

const startPolling = () => {
  setInterval(() => {
    // Find a free worker
    const freeWorker = workers.find(w => !w.busy);
    
    // If we have a free worker AND a job in queue
    if (freeWorker) {
      const jobId = store.dequeue();
      
      if (jobId) {
        // Assign Job
        const job = store.findById(jobId);
        job.status = JOB_STATUS.IN_PROGRESS;
        job.updatedAt = new Date();
        
        console.log(`[Manager] Assigning Job ${jobId} to Worker ${freeWorker.id}`);
        
        // Mark Busy
        freeWorker.busy = true;
        activeWorkers.set(freeWorker.id, jobId);
        
        // Send data to thread
        freeWorker.worker.postMessage(job);
      }
    }
  }, CONFIG.POLL_INTERVAL_MS); // Check every 100ms or 1s
};

module.exports = { init };