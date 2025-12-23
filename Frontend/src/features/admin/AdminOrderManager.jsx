import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const AdminOrderManager = () => {
  return (
    <div className="p-6">
      <Card className="p-8 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Management</h1>
        <p className="text-gray-600 mb-6">
          Manage all customer orders, payments, and order status from here.
        </p>
        <Button variant="primary">Coming Soon</Button>
      </Card>
    </div>
  );
};

export default AdminOrderManager;
