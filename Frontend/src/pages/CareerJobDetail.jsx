import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'https://3digree-backend.onrender.com';

const CareerJobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/careers/${jobId}`)
      .then(res => setJob(res.data.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Job Not Found</h2>
        <Link to="/careers" className="text-blue-600 hover:underline">← Back to Careers</Link>
      </div>
    </div>
  );

  const isExpired = new Date(job.expiryDate) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/careers" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium">
          ← Back to all openings
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image */}
          {job.image && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img
                src={`${API}${job.image}`}
                alt={job.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full mb-2">
                  #{job.jobId}
                </span>
                <h1 className="text-3xl font-extrabold text-gray-900">{job.title}</h1>
              </div>
              {isExpired && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">
                  EXPIRED
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 my-5">
              <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full">
                ⏱️ {job.timePeriod}
              </span>
              <span className="flex items-center gap-1 bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full">
                💼 {job.experience}
              </span>
              <span className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full ${
                isExpired ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
              }`}>
                📅 {isExpired ? 'Expired' : 'Closes'}: {new Date(job.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {/* Divider */}
            <hr className="my-6 border-gray-100" />

            {/* Description */}
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">About this role</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {!isExpired && (
                <a
                  href="mailto:careers@3digree.in"
                  className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Apply Now ✉️
                </a>
              )}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                {copied ? '✅ Copied!' : '🔗 Share Job'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerJobDetail;
