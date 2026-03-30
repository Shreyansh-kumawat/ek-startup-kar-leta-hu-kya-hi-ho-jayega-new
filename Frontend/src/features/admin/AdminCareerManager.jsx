import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/useAuth';

const API = import.meta.env.VITE_API_URL || 'https://3digree-backend.onrender.com';

const emptyForm = {
  title: '',
  description: '',
  timePeriod: '',
  experience: '',
  expiryDate: '',
  image: null,
};

const AdminCareerManager = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/careers/admin/all`, { headers });
      setJobs(res.data.data || []);
    } catch { setJobs([]); }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setForm(f => ({ ...f, image: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });

      if (editId) {
        await axios.put(`${API}/api/careers/${editId}`, fd, { headers });
      } else {
        await axios.post(`${API}/api/careers`, fd, { headers });
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      setPreview(null);
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving job');
    }
    setSubmitting(false);
  };

  const handleEdit = (job) => {
    setForm({
      title: job.title,
      description: job.description,
      timePeriod: job.timePeriod,
      experience: job.experience,
      expiryDate: job.expiryDate?.split('T')[0],
      image: null,
    });
    setEditId(job._id);
    setPreview(job.image ? `${API}${job.image}` : null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job? This cannot be undone.')) return;
    await axios.delete(`${API}/api/careers/${id}`, { headers });
    fetchJobs();
  };

  const handleToggle = async (job) => {
    const fd = new FormData();
    fd.append('isActive', !job.isActive);
    await axios.put(`${API}/api/careers/${job._id}`, fd, { headers });
    fetchJobs();
  };

  const handleShare = (jobId) => {
    navigator.clipboard.writeText(`${window.location.origin}/careers/${jobId}`);
    alert('Link copied!');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Career Management</h1>
          <p className="text-gray-500 text-sm mt-1">{jobs.length} job(s) total</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setEditId(null); setPreview(null); setShowForm(true); }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          + Add Job
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? 'Edit Job' : 'Add New Job'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period *</label>
                <input name="timePeriod" value={form.timePeriod} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Full-time, 3 months" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <input name="experience" value={form.experience} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Fresher, 1-2 years" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe the role, responsibilities, requirements..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Image</label>
              <input type="file" name="image" accept="image/*" onChange={handleChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {preview && (
                <img src={preview} alt="preview" className="mt-3 h-32 w-auto rounded-xl object-cover border" />
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity">
                {submitting ? 'Saving...' : editId ? 'Update Job' : 'Create Job'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); setPreview(null); }}
                className="px-6 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs Table */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">💼</div>
          <p className="font-medium">No jobs yet. Add your first job!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const expired = new Date(job.expiryDate) < new Date();
            return (
              <div key={job._id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start hover:shadow-sm transition-shadow">
                {/* Image */}
                {job.image ? (
                  <img src={`${API}${job.image}`} alt={job.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💼</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">#{job.jobId}</span>
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    {expired && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-semibold">EXPIRED</span>}
                    {!job.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">INACTIVE</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{job.description}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                    <span>⏱️ {job.timePeriod}</span>
                    <span>💼 {job.experience}</span>
                    <span>📅 {new Date(job.expiryDate).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(job)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">Edit</button>
                  <button onClick={() => handleToggle(job)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    job.isActive ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}>{job.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleShare(job.jobId)} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">🔗 Share</button>
                  <button onClick={() => handleDelete(job._id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCareerManager;
