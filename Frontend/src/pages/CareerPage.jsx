import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL ||
  (import.meta.env.PROD ? 'https://ek-startup-kar-leta-hu-kya-hi-ho-jayega.onrender.com' : 'http://localhost:5000');

const CareerPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/careers')
      .then(res => setJobs(res.data.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleShare = (jobId) => {
    const url = `${window.location.origin}/careers/${jobId}`;
    navigator.clipboard.writeText(url);
    alert('Link copied! 🎉');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Join Our Team 🚀</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Be a part of 3Digree — we're building the future of web development.
          </p>
        </div>
      </div>

      {/* Jobs */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        {jobs.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">No openings right now</h2>
            <p className="text-gray-500">Check back soon! We're always growing.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              {jobs.length} Open Position{jobs.length > 1 ? 's' : ''}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {jobs.map(job => (
                <div key={job._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                  {job.image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={`${SERVER}${job.image}`}
                        alt={job.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full mb-3">
                      #{job.jobId}
                    </span>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {job.timePeriod && (
                        <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                          ⏱️ {job.timePeriod}
                        </span>
                      )}
                      <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        💼 {job.experience}
                      </span>
                      <span className="flex items-center gap-1 bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full">
                        📅 Expires: {new Date(job.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        to={`/careers/${job.jobId}`}
                        className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleShare(job.jobId)}
                        title="Copy link"
                        className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors text-sm"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CareerPage;
