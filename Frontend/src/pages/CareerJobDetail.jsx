import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/apiClient';

const SERVER = import.meta.env.VITE_SERVER_BASE_URL ||
  (import.meta.env.PROD ? 'https://ek-startup-kar-leta-hu-kya-hi-ho-jayega.onrender.com' : 'http://localhost:5000');

const emptyForm = { name: '', age: '', gender: '', email: '', phone: '', message: '' };

const CareerJobDetail = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    apiClient.get(`/careers/${jobId}`)
      .then(res => setJob(res.data.data))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name || !form.age || !form.gender || !form.email || !form.phone) {
      setFormError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post('/careers/apply', {
        jobId: job.jobId,
        jobTitle: job.title,
        ...form,
      });
      setSubmitted(true);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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
        <Link to="/careers" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium">
          ← Back to all openings
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Image */}
          {job.image && (
            <div className="h-64 md:h-80 overflow-hidden">
              <img src={`${SERVER}${job.image}`} alt={job.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-8">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <span className="inline-block bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded-full mb-2">#{job.jobId}</span>
                <h1 className="text-3xl font-extrabold text-gray-900">{job.title}</h1>
              </div>
              {isExpired && <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full flex-shrink-0">EXPIRED</span>}
            </div>

            <div className="flex flex-wrap gap-2 my-5">
              {job.timePeriod && (
                <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full">⏱️ {job.timePeriod}</span>
              )}
              <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full">💼 {job.experience}</span>
              <span className={`text-sm px-3 py-1.5 rounded-full ${isExpired ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                📅 {isExpired ? 'Expired' : 'Closes'}: {new Date(job.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <hr className="my-6 border-gray-100" />

            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-3">About this role</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              {!isExpired && !submitted && (
                <button
                  onClick={() => setShowApply(v => !v)}
                  className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  {showApply ? 'Hide Form' : 'Apply Now ✉️'}
                </button>
              )}
              {submitted && (
                <div className="flex-1 text-center bg-green-50 border border-green-200 text-green-700 font-semibold py-3 rounded-xl">
                  ✅ Application Submitted! We’ll be in touch.
                </div>
              )}
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
              >
                {copied ? '✅ Copied!' : '🔗 Share Job'}
              </button>
            </div>

            {/* Apply Form */}
            {showApply && !submitted && !isExpired && (
              <form onSubmit={handleApplySubmit} className="mt-6 bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Apply for {job.title}</h3>

                {formError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">{formError}</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="Your full name"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Age *</label>
                    <input
                      name="age" type="number" min="16" max="60" value={form.age} onChange={handleChange} required
                      placeholder="e.g. 22"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender *</label>
                    <select
                      name="gender" value={form.gender} onChange={handleChange} required
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                    <input
                      name="email" type="email" value={form.email} onChange={handleChange} required
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      name="phone" type="tel" value={form.phone} onChange={handleChange} required
                      placeholder="+91 9876543210"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Anything to add? <span className="text-gray-400 font-normal">(optional)</span></label>
                    <textarea
                      name="message" value={form.message} onChange={handleChange} rows={4}
                      placeholder="Tell us something about yourself, your skills, or why you're a great fit..."
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerJobDetail;
