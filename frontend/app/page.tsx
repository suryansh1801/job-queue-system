"use client";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/jobs";; // Ensure port matches .env (8000)

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "io_wait",
    to: "user@example.com",
    body: "Hello world",
    shouldFail: false, // New state for failure simulation
  });

  // Fetch jobs function
  const fetchJobs = async () => {
    try {
      const res = await axios.get(API_URL);
      setJobs(res.data.jobs);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    }
  };

  // Polling: Update list every 1 second (Faster polling to see retries)
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 1000);
    return () => clearInterval(interval);
  }, []);

  // Submit Job
  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(API_URL, {
        type: formData.type,
        payload: { 
          to: formData.to, 
          body: formData.body,
          shouldFail: formData.type === 'email' && formData.shouldFail // Send the failure flag only for email jobs
        },
      });
      fetchJobs(); // Refresh immediately
    } catch (err) {
      alert("Error submitting job");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800"> Job Queue Dashboard</h1>

        {/* --- Submission Form --- */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-blue-600">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Submit New Job</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Type</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="email">Email Service</option>
                  <option value="cpu_heavy">CPU Heavy</option>
                  <option value="io_wait">I/O Wait</option>
                </select>
              </div>

              {/* Recipient Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Target / Recipient</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-700"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition 
                ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? "Submitting..." : "Enqueue Job"}
            </button>
          </form>
        </div>

        {/* --- Jobs List --- */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Live Job Status</h2>
            <div className="text-sm text-gray-500 animate-pulse">
              Auto-refreshing every 1s
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result / Error</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job : any) => (
                  <tr key={job.jobId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {job.jobId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {job.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {job.retryCount > 0 ? (
                        <span className="text-orange-600 font-bold">{job.retryCount}</span>
                      ) : (
                        <span className="text-gray-300">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <ResultCell result={job.result} status={job.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No jobs in the queue. Start by submitting one above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components for Clean Code ---

function StatusBadge({ status }: { status: string }) {
  const styles = {
    QUEUED: 'bg-gray-100 text-gray-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 animate-pulse',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800 font-bold'
  };

  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status as keyof typeof styles] || styles.QUEUED}`}>
      {status}
    </span>
  );
}

function ResultCell({ result, status }: { result: any; status: string }) {
  if (!result) return <span className="text-gray-400">-</span>;

  // If Failed, show error in red
  if (status === 'FAILED' || result.error) {
    return (
      <span className="text-red-600 font-medium truncate max-w-xs block" title={result.error}>
        ⚠️ {result.error}
      </span>
    );
  }

  // If Success, show output
  return (
    <span className="text-gray-600 truncate max-w-xs block" title={JSON.stringify(result)}>
      {result.message || JSON.stringify(result)}
    </span>
  );
}