import React, { useState, useRef, useEffect } from 'react';
import { Upload, Button, message, Modal, List, Tooltip } from 'antd';
import {
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PlusOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import PdfPreview from './PdfPreview';
import FileLoading from './FileLoading';

const { Dragger } = Upload;

interface UploadedFileItem {
  id: string;
  file: File;
  status: 'uploading' | 'analyzing' | 'completed' | 'failed';
  result?: string;
  taskId?: string;
}

// 模拟 API
const mockUploadAPI = (_file: File) => {
  return new Promise<{ taskId: string }>((resolve) => {
    setTimeout(() => {
      resolve({ taskId: `task-${Date.now()}-${Math.random()}` });
    }, 1500);
  });
};

const mockAnalysisResult = ``;

const ResumeUpload: React.FC = () => {
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [viewMode, setViewMode] = useState<'upload' | 'loading' | 'list'>(
    'upload'
  );
  const [previewItem, setPreviewItem] = useState<UploadedFileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 轮询定时器管理
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // 清理所有定时器
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearInterval(timer));
      timersRef.current.clear();
    };
  }, []);

  // 监听文件列表状态，自动切换视图
  useEffect(() => {
    if (fileList.length === 0) {
      setViewMode('upload');
      return;
    }

    const hasProcessing = fileList.some(
      (f) => f.status === 'uploading' || f.status === 'analyzing'
    );
    if (hasProcessing) {
      setViewMode('loading');
    } else {
      setViewMode('list');
    }
  }, [fileList]);

  const startPolling = (_taskId: string, fileId: string) => {
    // 直接标记为完成（后续接入真实解析后再恢复轮询逻辑）
    setFileList((prev) =>
      prev.map((item) =>
        item.id === fileId
          ? { ...item, status: 'completed', result: '解析完成' }
          : item
      )
    );
  };

  const handleUploadFiles = async (files: File[]) => {
    // 初始化文件列表项
    const newItems: UploadedFileItem[] = files.map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      file,
      status: 'uploading',
    }));

    setFileList((prev) => [...prev, ...newItems]);
    setViewMode('loading'); // 立即切换到 loading

    // 并发上传
    for (const item of newItems) {
      try {
        const { taskId } = await mockUploadAPI(item.file);
        // 更新 item 的 taskId 并开始轮询
        setFileList((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id ? { ...prevItem, taskId } : prevItem
          )
        );
        startPolling(taskId, item.id);
      } catch (error) {
        setFileList((prev) =>
          prev.map((prevItem) =>
            prevItem.id === item.id
              ? { ...prevItem, status: 'failed' }
              : prevItem
          )
        );
      }
    }
  };

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    accept: '.pdf,.doc,.docx',
    beforeUpload: (_, fileList) => {
      // 过滤文件
      const validFiles = fileList.filter((file) => {
        const isValidType =
          file.type === 'application/pdf' ||
          file.type === 'application/msword' ||
          file.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        const isLt10M = file.size / 1024 / 1024 < 10;

        if (!isValidType) {
          message.error(`${file.name}: 格式不支持`);
        }
        if (!isLt10M) {
          message.error(`${file.name}: 大小超过 10MB`);
        }
        return isValidType && isLt10M;
      });

      if (validFiles.length > 0) {
        handleUploadFiles(validFiles);
      }
      return false; // 阻止自动上传
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  const handleDelete = (id: string) => {
    setFileList((prev) => prev.filter((item) => item.id !== id));
    // 清理该文件的定时器
    if (timersRef.current.has(id)) {
      clearInterval(timersRef.current.get(id)!);
      timersRef.current.delete(id);
    }
  };

  const handlePreview = (item: UploadedFileItem) => {
    setPreviewItem(item);
    setIsPreviewOpen(true);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) {
      return <FilePdfOutlined className="text-2xl text-red-500" />;
    }
    return <FileWordOutlined className="text-2xl text-blue-500" />;
  };

  // 渲染不同的视图
  const renderView = () => {
    if (viewMode === 'upload') {
      return (
        <div className="flex h-full flex-col justify-center rounded-xl border-2 border-dashed border-blue-200 bg-white p-8 shadow-sm transition-colors hover:border-blue-400">
          <Dragger
            {...props}
            style={{ border: 'none', background: 'transparent' }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined style={{ color: '#3b82f6', fontSize: '64px' }} />
            </p>
            <p className="ant-upload-text mt-4 text-xl font-medium text-gray-700">
              将简历拖拽至此处，支持批量上传
            </p>
            <p className="ant-upload-hint mb-6 text-gray-500">
              支持 .pdf, .docx, .doc 文件
            </p>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              className="h-12 rounded-lg bg-blue-600 px-8 text-lg"
            >
              上传本地文件
            </Button>
          </Dragger>
        </div>
      );
    }

    if (viewMode === 'loading') {
      return <FileLoading statusText="文件上传与分析中..." />;
    }

    // List View
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <CheckCircleFilled className="text-green-500" />
            上传完成
          </h3>
          <Upload {...props}>
            <Button type="primary" icon={<PlusOutlined />}>
              继续上传
            </Button>
          </Upload>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <List
            itemLayout="horizontal"
            dataSource={fileList}
            renderItem={(item) => (
              <List.Item
                className="mb-3 rounded-xl border border-gray-100 bg-white px-6 py-4 shadow-sm transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/50 hover:shadow-md"
                actions={[
                  <Tooltip title="查看详情">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => handlePreview(item)}
                      className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    />
                  </Tooltip>,
                  <Tooltip title="移除">
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(item.id)}
                      className="hover:bg-red-50"
                    />
                  </Tooltip>,
                ]}
              >
                <List.Item.Meta
                  avatar={getFileIcon(item.file.name)}
                  title={
                    <span className="font-medium text-gray-700">
                      {item.file.name}
                    </span>
                  }
                  description={
                    <span className="text-xs text-gray-400">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      {item.status === 'completed' && (
                        <span className="ml-2 text-green-500">● 解析成功</span>
                      )}
                      {item.status === 'failed' && (
                        <span className="ml-2 text-red-500">● 解析失败</span>
                      )}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full w-full">{renderView()}</div>

      {/* 预览模态框 - 使用全屏风格或大宽度的 Modal */}
      <Modal
        title={previewItem?.file.name}
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width="800px"
        style={{ top: 20 }}
        styles={{ body: { height: '80vh', padding: 0, overflow: 'hidden' } }}
        destroyOnHidden
      >
        {previewItem && (
          <div className="flex h-full w-full items-center justify-center bg-gray-50">
            {previewItem.file.type === 'application/pdf' ? (
              <PdfPreview file={previewItem.file} />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <FileWordOutlined className="mb-4 text-6xl text-blue-300" />
                <p>Word 文档暂不支持在线预览</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default ResumeUpload;
