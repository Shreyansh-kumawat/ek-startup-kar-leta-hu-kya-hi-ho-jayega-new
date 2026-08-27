import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

const emptyForm = { title: '', description: '', timePeriod: '', experience: '', expiryDate: '', image: null };

const AdminCareerManager = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('careers')
        .select('*')
        .order('created_at', { ascending: false });
      setJobs(data || []);
    } catch { setJobs([]); }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const fetchApplications = async (jobId, title) => {
    setViewingJob({ jobId, title });
    setAppsLoading(true);
    try {
      const { data } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
      setApplications(data || []);
    } catch { setApplications([]); }
    setAppsLoading(false);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files[0]) {
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
      let imageUrl = null;
      if (form.image instanceof File) {
        const uploadForm = new FormData();
        uploadForm.append('file', form.image);
        uploadForm.append('folder', '3digree/careers');
        const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-image', {
          body: uploadForm,
        });
        if (uploadError) throw uploadError;
        imageUrl = uploadResult?.data?.url;
      }

      const jobData = {
        title: form.title,
        description: form.description,
        time_period: form.timePeriod,
        experience: form.experience,
        expiry_date: form.expiryDate,
      };
      if (imageUrl) jobData.image = imageUrl;

      if (editId) {
        jobData.updated_at = new Date().toISOString();
        await supabase.from('careers').update(jobData).eq('id', editId);
      } else {
        await supabase.from('careers').insert(jobData);
      }

      setForm(emptyForm); setEditId(null); setShowForm(false); setPreview(null);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Error saving job');
    }
    setSubmitting(false);
  };

  const handleEdit = (job) => {
    setForm({
      title: job.title || '',
      description: job.description || '',
      timePeriod: job.time_period || '',
      experience: job.experience || '',
      expiryDate: job.expiry_date?.split('T')[0] || '',
      image: null,
    });
    setEditId(job.id);
    setPreview(job.image || null);
    setShowForm(true);
    setViewingJob(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job?')) return;
    await supabase.from('careers').delete().eq('id', id);
    fetchJobs();
  };

  const handleToggle = async (job) => {
    await supabase.from('careers').update({ is_active: !job.is_active }).eq('id', job.id);
    fetchJobs();
  };

  const handleShare = (jobId) => {
    navigator.clipboard.writeText(`${window.location.origin}/careers/${jobId}`);
    alert('Link copied!');
  };

  if (viewingJob) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <button onClick={() => setViewingJob(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium">
          Back to Jobs
        </button>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Applications</h1>
        <p className="text-gray-500 text-sm mb-6">Job: <span className="font-semibold text-gray-700">{viewingJob.title}</span> <span className="text-blue-500">#{viewingJob.jobId}</span></p>

        {appsLoading ? (
          <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="font-medium">No applications yet for this job.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{applications.length} application(s) received</p>
            {applications.map((app, i) => (
              <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">#{i + 1}</span>
                    <h3 className="font-bold text-gray-900 text-lg">{app.name}</h3>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div><span className="text-gray-400">Age</span><p className="font-semibold text-gray-800">{app.age}</p></div>
                  <div><span className="text-gray-400">Gender</span><p className="font-semibold text-gray-800">{app.gender}</p></div>
                  <div><span className="text-gray-400">Email</span><p className="font-semibold text-gray-800 break-all">{app.email}</p></div>
                  <div><span className="text-gray-400">Phone</span><p className="font-semibold text-gray-800">{app.phone}</p></div>
                </div>
                {app.message && (
                  <div className="mt-3 bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 mb-1">Message</p>
                    <p className="text-sm text-gray-700">{app.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
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

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">{editId ? 'Edit Job' : 'Add New Job'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Frontend Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time Period <span className="text-gray-400">(optional)</span></label>
                <input name="timePeriod" value={form.timePeriod} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Full-time, 3 months" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
                <input name="experience" value={form.experience} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Fresher, 1-2 years" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe the role, responsibilities, requirements..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Image <span className="text-gray-400">(optional)</span></label>
              <input type="file" name="image" accept="image/*" onChange={handleChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              {preview && <img src={preview} alt="preview" className="mt-3 h-32 w-auto rounded-xl object-cover border" />}
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

      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="font-medium">No jobs yet. Add your first job!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const expired = new Date(job.expiry_date) < new Date();
            return (
              <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4 items-start hover:shadow-sm transition-shadow">
                {job.image ? (
                  <img src={job.image} alt={job.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">Job</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">#{job.job_id}</span>
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    {expired && <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full font-semibold">EXPIRED</span>}
                    {!job.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-semibold">INACTIVE</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{job.description}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-gray-400 flex-wrap">
                    {job.time_period && <span>{job.time_period}</span>}
                    <span>{job.experience}</span>
                    <span>{new Date(job.expiry_date).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => fetchApplications(job.job_id, job.title)}
                    className="text-xs px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium">
                    Applications
                  </button>
                  <button onClick={() => handleEdit(job)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium">Edit</button>
                  <button onClick={() => handleToggle(job)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    job.is_active ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                  }`}>{job.is_active ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => handleShare(job.job_id)} className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium">Share</button>
                  <button onClick={() => handleDelete(job.id)} className="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium">Delete</button>
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
