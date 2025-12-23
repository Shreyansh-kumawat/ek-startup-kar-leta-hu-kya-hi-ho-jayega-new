import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminProjectManager = () => {
  return (
    <div className="p-6">
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Management</h1>
        <p className="text-gray-600 mb-6">
          Track project progress, manage deliverables, and update project status.
        </p>
        <Button variant="primary">Coming Soon</Button>
      </Card>
    </div>
  );
};

export default AdminProjectManager;
