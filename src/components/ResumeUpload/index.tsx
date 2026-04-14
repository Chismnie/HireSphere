import React, { useState, useEffect } from 'react';
import { Upload, Button, message, Modal, List, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  InboxOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  PlusOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import PdfPreview from './PdfPreview';
import FileLoading from './FileLoading';

const { Dragger } = Upload;

import { uploadResume } from '@/apis/Common/Resume';
import { getJobProfiles } from '@/apis/HR/Job';
import { getResumeUrl } from '@/apis/HR/Resume';
// Import getAllTalents to refresh dashboard if needed
// However, ResumeUpload is usually in a separate page/modal.
// The prompt says "update seeker info in interview dashboard".
// This likely means ResumeUpload should trigger a refresh in JobDashboard OR 
// we should update the local state/cache that JobDashboard uses.
// Since they are separate components, we can use a global store or event bus.
// For now, let's verify if JobDashboard automatically fetches data.
// JobDashboard fetches data on mount.
// If ResumeUpload is done, the user might navigate to JobDashboard.
// The user input implies that AFTER upload, the info should be displayed.
// This is already handled if JobDashboard fetches `getAllTalents` which includes the new resume.
// Let's check `getAllTalents` in `src/view/HR/Interview/JobDashboard.tsx`.
// It calls `getAllTalents`.
// So if `uploadResume` successfully saves to backend, `getAllTalents` should return it.
// The missing piece might be notifying the user or redirecting.

interface UploadedFileItem {
  id: string;
  file: File;
  status: 'uploading' | 'analyzing' | 'completed' | 'failed';
  result?: any;
}

interface ResumeUploadProps {
  isSeeker?: boolean;
}

import useUserStore from '@/store/modules/user';

const ResumeUpload: React.FC<ResumeUploadProps> = ({ isSeeker = false }) => {
  const navigate = useNavigate();
  const { setId, role, id } = useUserStore();
  const [fileList, setFileList] = useState<UploadedFileItem[]>([]);
  const [hasJobProfile, setHasJobProfile] = useState(localStorage.getItem('has_job_profile') === 'true');
  const [currentJobName, setCurrentJobName] = useState(localStorage.getItem('current_job_name') || '');
  const [isCheckingProfile, setIsCheckingProfile] = useState(role === 'hr' && !isSeeker); // 仅 HR 需要检查
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'upload' | 'loading' | 'list'>(
    'upload'
  );
  const [previewItem, setPreviewItem] = useState<UploadedFileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 1. 自动检查岗位画像列表 (仅限 HR 端)
  useEffect(() => {
    if (role !== 'hr' || isSeeker) {
        setIsCheckingProfile(false);
        return;
    }

    const checkProfiles = async () => {
      try {
        setIsCheckingProfile(true);
        const res: any = await getJobProfiles();
        const resCode = res.code ?? res.Code;
        const resData = res.data ?? res.Data;
        
        if (resCode === 200 || resCode === 0) {
          const list = resData?.list || [];
          if (list.length > 0) {
            // 已有画像
            setHasJobProfile(true);
            localStorage.setItem('has_job_profile', 'true');
            // 如果本地没有存储当前岗位名称，默认取第一个
            if (!currentJobName) {
              const firstName = list[0].job_title;
              setCurrentJobName(firstName);
              localStorage.setItem('current_job_name', firstName);
            }
          } else {
            // 无画像
            setHasJobProfile(false);
            localStorage.setItem('has_job_profile', 'false');
          }
        }
      } catch (error) {
        console.error('Check job profiles failed:', error);
      } finally {
        setIsCheckingProfile(false);
      }
    };
    
    checkProfiles();
  }, []);

  // 1.5 获取简历 URL (针对 Seeker)
  useEffect(() => {
    if ((role === 'seeker' || isSeeker) && id) {
      getResumeUrl(id).then((res: any) => {
        const resCode = res.Code ?? res.code;
        const resData = res.Data ?? res.data;
        if ((resCode === 200 || resCode === 0) && resData?.resume_url) {
          setResumeUrl(resData.resume_url);
        }
      }).catch(console.error);
    }
  }, [role, id, isSeeker]);

  // 2. 监听文件列表状态，自动切换视图
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
        const res = await uploadResume(item.file);
        // @ts-ignore
        if (res.code === 200 || res.code === 0) {
            setId(res.data.talent_id); // Save talent ID
             setFileList((prev) =>
              prev.map((prevItem) =>
                prevItem.id === item.id
                  ? { ...prevItem, status: 'completed', result: res.data }
                  : prevItem
              )
            );
            message.success(`${item.file.name} 上传成功`);
            
            // 如果是 seeker，更新预览 URL
            if ((role === 'seeker' || isSeeker) && res.data.resume_url) {
                setResumeUrl(res.data.resume_url);
            }

            // Add: Prompt user to view in dashboard
            Modal.success({
                title: '简历解析成功',
                content: (role === 'hr' && !isSeeker)
                  ? `候选人 ${res.data.full_name} 的简历已上传并解析，匹配岗位：${res.data.target_position}。`
                  : `您的简历已上传成功并解析完成。`,
                okText: (role === 'hr' && !isSeeker) ? '去面试看板查看' : '去简历诊断查看',
                onOk: () => {
                    if (role === 'hr' && !isSeeker) {
                        // Navigate to dashboard
                        navigate('/hr', { state: { activeTab: 'dashboard' } });
                    } else {
                        // Seeker navigation - using custom event for SeekerDashboard
                        window.dispatchEvent(new CustomEvent('switch_seeker_tab', { detail: { tab: 'diagnosis' } }));
                    }
                }
            });

        } else {
            throw new Error(res.message || 'Upload failed');
        }
       
      } catch (error) {
        console.error(error);
        message.error(`${item.file.name} 上传失败`);
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
    // 加载中状态
    if (isCheckingProfile && role === 'hr' && !isSeeker) {
      return (
        <div className="flex h-full items-center justify-center">
          <FileLoading statusText="正在检查岗位画像状态..." />
        </div>
      );
    }

    // 4. 空状态引导 (仅限 HR 端)
    if (role === 'hr' && !hasJobProfile && !isSeeker) {
      return (
        <div className="flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
            <SettingOutlined className="text-4xl text-orange-400" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-gray-800">暂未设置岗位画像</h3>
          <p className="mb-8 max-w-md text-gray-500">
            建议您先完成岗位画像设置。岗位画像是简历智能筛选的核心依据，设置后系统将自动为您分析简历与岗位的匹配度。
          </p>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="h-12 rounded-xl bg-blue-600 px-8 text-lg font-medium shadow-lg shadow-blue-200"
            onClick={() => {
                // 发送自定义事件切换 Tab，避免刷新页面
                window.dispatchEvent(new CustomEvent('switch_hr_tab', { detail: { tab: 'jobProfile' } }));
            }}
          >
            去设置岗位画像
          </Button>
        </div>
      );
    }

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
