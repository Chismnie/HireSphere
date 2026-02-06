import React from 'react';
import { Spin } from 'antd';

interface FileLoadingProps {
  statusText?: string;
}

const FileLoading: React.FC<FileLoadingProps> = ({
  statusText = '文件分析中...',
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* 自定义大号 Spinner */}
        <div className="relative">
          <Spin size="large" />
          <div className="absolute inset-0 bg-white/0" /> {/* 占位，防止点击 */}
        </div>
        <div className="animate-pulse text-2xl font-bold tracking-wide text-gray-500">
          {statusText}
        </div>
      </div>
    </div>
  );
};

export default FileLoading;
