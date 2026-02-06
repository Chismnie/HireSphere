import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const SeekerDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Seeker Dashboard</h1>
      <p>欢迎来到求职者中心！</p>
      <Button onClick={() => navigate('/login')} className="mt-4">
        Logout
      </Button>
    </div>
  );
};

export default SeekerDashboard;
