import React from 'react';

const StatusBox = ({ project }) => {
  if (!project) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'initiated':
        return {
          icon: '⏰',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          title: 'Project Initiated',
          message: 'Your project is in queue and will be started soon.',
          color: 'text-yellow-800'
        };
      case 'in_progress':
        return {
          icon: '🚀',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          title: 'Development in Progress',
          message: 'Our team is actively working on your website.',
          color: 'text-blue-800'
        };
      case 'review':
        return {
          icon: '⚠️',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          title: 'Under Review',
          message: 'Your project is being reviewed and tested.',
          color: 'text-orange-800'
        };
      case 'completed':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          title: 'Project Completed',
          message: 'Your website is ready and live!',
          color: 'text-green-800'
        };
      default:
        return {
          icon: '⏰',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          title: 'Status Unknown',
          message: 'Project status is being updated.',
          color: 'text-gray-800'
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);

  const getNextSteps = () => {
    switch (project.status) {
      case 'initiated':
        return [
          'Our team will review your requirements',
          'Development will start within 24-48 hours',
          'You\'ll receive a preview link soon'
        ];
      case 'in_progress':
        return [
          'Check back for preview updates',
          'Preview link will be shared soon',
          'Feel free to contact us for updates'
        ];
      case 'review':
        return [
          'Final testing is in progress',
          'We\'re ensuring everything works perfectly',
          'Launch preparations are underway'
        ];
      case 'completed':
        return [
          'Your website is live and ready',
          'Check your live website link',
          'Contact us for any post-launch support'
        ];
      default:
        return ['Status will be updated soon'];
    }
  };

  const getEstimatedTime = () => {
    switch (project.status) {
      case 'initiated':
        return '24-48 hours';
      case 'in_progress':
        return '3-5 business days';
      case 'review':
        return '1-2 business days';
      case 'completed':
        return 'Complete';
      default:
        return 'TBD';
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
      {/* Status Header */}
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-md ${statusConfig.bgColor}`}>
          <span className={`text-xl ${statusConfig.iconColor}`}>{statusConfig.icon}</span>
        </div>
        <div>
          <h3 className={`font-semibold ${statusConfig.color}`}>
            {statusConfig.title}
          </h3>
          <p className={`text-sm ${statusConfig.color} opacity-80`}>
            {statusConfig.message}
          </p>
        </div>
      </div>

      {/* Estimated Time */}
      {project.status !== 'completed' && (
        <div className="mb-4 p-3 bg-white rounded-md border">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Estimated Time</span>
            <span className="text-sm text-gray-900 font-semibold">
              {getEstimatedTime()}
            </span>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="space-y-3">
        <h4 className={`font-medium ${statusConfig.color}`}>
          {project.status === 'completed' ? 'What\'s Next:' : 'Next Steps:'}
        </h4>
        <ul className="space-y-2">
          {getNextSteps().map((step, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.iconColor} mt-2 flex-shrink-0`}></div>
              <span className={`text-sm ${statusConfig.color} opacity-80`}>
                {step}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Notifications */}
      {project.notifications && project.notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-50">
          <h4 className={`font-medium ${statusConfig.color} mb-2`}>Recent Updates:</h4>
          <div className="space-y-2">
            {project.notifications.slice(-3).map((notification, index) => (
              <div key={index} className="text-xs text-gray-600 bg-white p-2 rounded">
                {notification.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {project.status === 'completed' && project.liveLink && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-50">
          <a
            href={project.liveLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            🚀 View Live Website
          </a>
        </div>
      )}
    </div>
  );
};

export default StatusBox;