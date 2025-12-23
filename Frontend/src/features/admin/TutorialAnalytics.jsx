// src/features/admin/TutorialAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { getTutorialAnalytics } from '../auth/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Loader from '../../components/Loader';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const TutorialAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTutorialAnalytics(dateRange.startDate || null, dateRange.endDate || null);
      
      if (response.success) {
        setAnalytics(response.data);
      } else {
        setError('Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to load tutorial analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDateFilter = () => {
    fetchAnalytics();
  };

  const handleClearFilter = () => {
    setDateRange({ startDate: '', endDate: '' });
    setTimeout(() => fetchAnalytics(), 100);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 font-semibold text-lg mb-2">⚠️ Error Loading Analytics</p>
        <p className="text-red-500 text-sm mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { summary, completionStats, videoDistribution, recentInteractions } = analytics;

  // ✅ Pie Chart Data - Yes vs No
  const pieChartData = {
    labels: ['Yes (Started Tutorial)', 'No (Declined)'],
    datasets: [
      {
        label: 'Tutorial Response',
        data: [summary.yesCount, summary.noCount],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#059669', '#dc2626'],
        borderWidth: 2,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { size: 14 },
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const percentage = summary.totalInteractions > 0 
              ? ((value / summary.totalInteractions) * 100).toFixed(1) 
              : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // ✅ Bar Chart Data - Completion Stats
  const completionBarData = {
    labels: ['Full Completion (100%)', 'Partial Completion', 'No Progress'],
    datasets: [
      {
        label: 'Users',
        data: [completionStats.fullCompletion, completionStats.partialCompletion, completionStats.noProgress],
        backgroundColor: ['#10b981', '#f59e0b', '#6b7280'],
        borderColor: ['#059669', '#d97706', '#4b5563'],
        borderWidth: 2,
      },
    ],
  };

  const completionBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Tutorial Completion Status (Yes Users Only)',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  // ✅ Line Chart Data - Video Watch Distribution
  const videoLabels = Array.from({ length: 15 }, (_, i) => `Video ${i + 1}`);
  const videoWatchCounts = Array.from({ length: 15 }, (_, i) => videoDistribution[`video${i + 1}`] || 0);

  const videoLineData = {
    labels: videoLabels,
    datasets: [
      {
        label: 'Users Who Watched',
        data: videoWatchCounts,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const videoLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Video Watch Distribution (1-15)',
        font: { size: 16, weight: 'bold' },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y} users watched this video`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">📊 AI Video Tutorial Analytics</h1>
        <p className="text-blue-100">Track user engagement and video completion rates</p>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleDateFilter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Apply Filter
          </button>
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={handleClearFilter}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Interactions</p>
              <p className="text-3xl font-bold text-gray-900">{summary.totalInteractions}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Started Tutorial (Yes)</p>
              <p className="text-3xl font-bold text-green-600">{summary.yesCount}</p>
              <p className="text-sm text-gray-500 mt-1">{summary.yesPercentage}% of total</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Declined Tutorial (No)</p>
              <p className="text-3xl font-bold text-red-600">{summary.noCount}</p>
              <p className="text-sm text-gray-500 mt-1">{summary.noPercentage}% of total</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <span className="text-3xl">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Avg. Completion</p>
              <p className="text-3xl font-bold text-purple-600">{summary.avgCompletion}%</p>
              <p className="text-sm text-gray-500 mt-1">of 15 videos</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <span className="text-3xl">📈</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Yes vs No */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Yes vs No Distribution</h2>
          <div style={{ height: '300px' }}>
            <Pie data={pieChartData} options={pieChartOptions} />
          </div>
        </div>

        {/* Bar Chart - Completion Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div style={{ height: '300px' }}>
            <Bar data={completionBarData} options={completionBarOptions} />
          </div>
        </div>
      </div>

      {/* Line Chart - Video Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div style={{ height: '400px' }}>
          <Line data={videoLineData} options={videoLineOptions} />
        </div>
      </div>

      {/* Recent Interactions Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">📋 Recent User Interactions (Last 50)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Videos Watched</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInteractions.length > 0 ? (
                recentInteractions.map((interaction, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{interaction.userName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{interaction.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        interaction.action === 'yes' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {interaction.action === 'yes' ? '✅ Yes' : '❌ No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {interaction.videosWatched}/{interaction.totalVideos}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                          <div
                            className={`h-2 rounded-full ${
                              interaction.completionPercentage === 100 
                                ? 'bg-green-500' 
                                : interaction.completionPercentage > 0 
                                ? 'bg-yellow-500' 
                                : 'bg-gray-300'
                            }`}
                            style={{ width: `${interaction.completionPercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{interaction.completionPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(interaction.startedAt).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No interactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TutorialAnalytics;
