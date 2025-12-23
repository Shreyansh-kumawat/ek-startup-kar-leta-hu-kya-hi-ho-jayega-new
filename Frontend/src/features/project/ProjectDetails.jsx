import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProjectDetails } from './api';
import StatusBox from './StatusBox';
import { useNotification } from '../../hooks/useNotification';
import Loader from '../../components/Loader';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    } else {
      // If no projectId, fetch user's main project
      fetchUserProject();
    }
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await getProjectDetails(projectId);
      setProject(response.data);
    } catch (error) {
      addNotification('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProject = async () => {
    try {
      setLoading(true);
      const response = await getProjectDetails();
      setProject(response.data);
    } catch (error) {
      addNotification('Failed to load project details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'initiated':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'initiated':
        return 'Project Initiated';
      case 'in_progress':
        return 'Work in Progress';
      case 'review':
        return 'Under Review';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'initiated':
        return 25;
      case 'in_progress':
        return 50;
      case 'review':
        return 75;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">📁</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No project found</h3>
        <p className="text-gray-500">You don't have any active projects yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Project Details
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <span>👤</span>
                <span>{project.userId?.name || 'User'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📅</span>
                <span>Started {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full border ${getStatusColor(project.status)}`}>
            <span className="font-medium">{getStatusText(project.status)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h2>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm text-gray-500">{getProgressPercentage(project.status)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(project.status)}%` }}
                ></div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {[
                { key: 'initiated', label: 'Project Initiated', desc: 'Your project has been created and is in queue' },
                { key: 'in_progress', label: 'Development Started', desc: 'Our team is actively working on your website' },
                { key: 'review', label: 'Review Phase', desc: 'Project is under review and testing' },
                { key: 'completed', label: 'Project Completed', desc: 'Your website is ready and delivered' }
              ].map((step, index) => {
                const isActive = getProgressPercentage(project.status) > (index * 25);
                const isCurrent = project.status === step.key;
                
                return (
                  <div key={step.key} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      isActive ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isActive ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Template Information */}
          {project.templateId && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Template Information</h2>
              
              <div className="flex items-start space-x-4">
                {project.templateId.previewImage && (
                  <img loading="lazy" 
                    src={project.templateId.previewImage}
                    alt={project.templateId.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {project.templateId.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3">
                    {project.templateId.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-blue-600">
                      ₹{project.templateId.price?.toLocaleString()}
                    </span>
                    
                    {project.templateId.templateLink && (
                      <a
                        href={project.templateId.templateLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <span className="mr-1">🔗</span>
                        View Original
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Project Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Project Links</h2>
            
            <div className="space-y-3">
              {/* Preview Link */}
              {project.previewLink ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <span className="text-blue-600 text-lg">👁️</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Preview Link</h4>
                      <p className="text-xs text-gray-500">Watermarked preview of your website</p>
                    </div>
                  </div>
                  <a
                    href={project.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <span className="mr-1">🔗</span>
                    Preview
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <span className="text-gray-400 text-lg">👁️</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Preview Link</h4>
                      <p className="text-xs text-gray-500">Will be available when development starts</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Coming Soon</span>
                </div>
              )}

              {/* Live Link */}
              {project.liveLink ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-md">
                      <span className="text-green-600 text-lg">🔗</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Live Website</h4>
                      <p className="text-xs text-gray-500">Your final website without watermark</p>
                    </div>
                  </div>
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    <span className="mr-1">🔗</span>
                    Visit Site
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <span className="text-gray-400 text-lg">🔗</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Live Website</h4>
                      <p className="text-xs text-gray-500">Will be available when project is completed</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">Pending</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Box */}
          <StatusBox project={project} />

          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Project ID</span>
                <span className="text-sm font-medium text-gray-900">
                  #{project._id.substring(0, 8)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {getStatusText(project.status)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Started</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              {project.monthlyPayment && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Plan</span>
                  <span className="text-sm font-medium text-gray-900">Monthly</span>
                </div>
              )}
            </div>
          </div>

          {/* Support */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-4">
              Have questions about your project? Our support team is here to help.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:support@3digree.com"
                className="block w-full text-center py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <span className="mr-1">📧</span>
                Contact Support
              </a>
              <button className="block w-full text-center py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors text-sm">
                Schedule Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;