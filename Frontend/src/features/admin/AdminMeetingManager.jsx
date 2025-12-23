import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminMeetingManager = () => {
  return (
    <div className="p-6">
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Meeting Management</h1>
        <p className="text-gray-600 mb-6">
          Schedule, manage, and track all client meetings and consultations.
        </p>
        <Button variant="primary">Coming Soon</Button>
      </Card>
    </div>
  );
};

export default AdminMeetingManager;
