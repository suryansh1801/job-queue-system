const { parentPort } = require('worker_threads');

// Helper: Simulate I/O Wait (Sleep)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Simulate CPU Intensive Task (Find nth prime)
const performCpuHeavyTask = (iterations) => {
  let count = 0;
  let num = 2;
  while (count < iterations) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) count++;
    num++;
  }
  return num - 1;
};

// Listen for messages from the Main Thread
parentPort.on('message', async (job) => {
  try {
    if (job.type === 'email') {
        await sleep(1000); 
        throw new Error("No email provider integrated");
    }
    const taskType = job.type === 'cpu_heavy' ? 'CPU_INTENSIVE' : 'IO_WAIT';
    let resultData;

    if (taskType === 'CPU_INTENSIVE') {
      // Simulate heavy calculation
      const start = Date.now();
      const iterations = Math.floor(Math.random() * 100000); // Random iterations up to 100k
      const prime = performCpuHeavyTask(iterations);
      const duration = Date.now() - start;
      resultData = { 
        type: 'CPU_INTENSIVE', 
        message: `Calculated ${iterations} iterations to find prime: ${prime}`, 
        duration: `${duration}ms` 
      };
    } else {
      // Simulate API call or Database wait
      await sleep(3000);
      resultData = { 
        type: 'IO_WAIT', 
        message: 'Finished waiting for external resource (3s)', 
      };
    }

    // 10% Chance of Failure
    if (Math.random() < 0.1) throw new Error("Randomized System Failure");

    // Send success back to Main Thread
    parentPort.postMessage({ success: true, result: resultData });

  } catch (error) {
    // Send error back to Main Thread
    parentPort.postMessage({ success: false, error: error.message });
  }
});