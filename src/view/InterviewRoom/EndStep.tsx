import React from 'react';
import { Card, Button } from 'antd';
import { CheckCircleOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface EndStepProps {
  interviewInfo: any;
}

const EndStep: React.FC<EndStepProps> = ({ interviewInfo }) => {
  const isHR = window.location.search.includes('hr-token');
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50" style={{backgroundImage: "url('/welcome-bg.png')", backgroundSize: 'cover'}}>
      <Card className="w-full max-w-2xl rounded-2xl shadow-xl border-gray-100 p-8 text-center bg-white/95 backdrop-blur-sm">
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 text-green-600">
            <CheckCircleOutlined className="text-4xl" />
          </div>
        </div>

        <h1 className="mb-8 text-3xl font-bold text-gray-800">
          {isHR ? '面试已结束' : '面试已结束，预祝您获得心仪的 offer'}
        </h1>

        <div className="mb-10 space-y-4 text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400">面试人:</span>
            <span className="font-medium text-gray-800 text-lg">{interviewInfo.candidateName}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400">面试官:</span>
            <span className="font-medium text-gray-800 text-lg">{interviewInfo.interviewer} —— {interviewInfo.company}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-400">面试岗位:</span>
            <span className="font-medium text-gray-800 text-lg">{interviewInfo.position}</span>
          </div>
        </div>

        {!isHR && (
          <Button
            type="primary"
            size="large"
            icon={<HomeOutlined />}
            className="h-12 w-48 rounded-full bg-blue-600 text-base font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
            onClick={handleGoHome}
          >
            返回主页
          </Button>
        )}
      </Card>
    </div>
  );
};

export default EndStep;
