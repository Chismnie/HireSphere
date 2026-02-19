import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Form, Input, message } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import useUserStore from '@/store/modules/user';

const { Title, Text } = Typography;

const AccountSettingsPage: React.FC = () => {
  const { role, profile, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        // Here you would typically send the values to the backend
        console.log('Saved values:', values);
        updateProfile(values);
        message.success('个人信息已更新');
        setIsEditing(false);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-y-auto p-8">
      <Title level={2} className="!mb-0 text-gray-800">
        账号设置
      </Title>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Left Column: Basic Info Card */}
        <div className="md:col-span-1">
          <Card className="h-full border-gray-300 shadow-sm">
            <div className="flex flex-col items-center gap-4 py-6">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                className="border border-gray-200 bg-blue-100 text-4xl text-blue-600"
              />
              <div className="text-center">
                <Title level={3} className="!mb-1">
                  {profile.username}
                </Title>
                <Text type="secondary">{role === 'seeker' ? '普通用户' : '人力资源主管'}</Text>
              </div>
              <div className="mt-4 flex w-full flex-col gap-2 px-4">
                <div className="flex items-center gap-3 text-gray-600">
                  <BankOutlined />
                  <span>{profile.company}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MailOutlined />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <PhoneOutlined />
                  <span>{profile.phone}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Profile & Security */}
        <div className="flex flex-col gap-6 md:col-span-2">
          {/* Edit Profile */}
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>基本信息</span>
                {!isEditing ? (
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => setIsEditing(true)}
                  >
                    修改
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={handleCancel}
                    >
                      取消
                    </Button>
                    <Button
                      type="primary"
                      size="small"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                    >
                      保存
                    </Button>
                  </div>
                )}
              </div>
            }
            className="border-gray-300 shadow-sm"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={profile}
              disabled={!isEditing}
              className={!isEditing ? "[&_.ant-input]:!text-gray-700 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-transparent [&_.ant-input]:!shadow-none [&_.ant-input-prefix]:!text-gray-500 [&_.ant-form-item-label_label]:!text-gray-500" : ""}
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Form.Item
                  label="姓名"
                  name="username"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>
                <Form.Item
                  label="公司名称"
                  name="company"
                  rules={[{ required: true, message: '请输入公司名称' }]}
                >
                  <Input prefix={<BankOutlined />} />
                </Form.Item>
                <Form.Item
                  label="邮箱"
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' },
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>
                <Form.Item
                  label="联系电话"
                  name="phone"
                  rules={[{ required: true, message: '请输入联系电话' }]}
                >
                  <Input prefix={<PhoneOutlined />} />
                </Form.Item>
              </div>
            </Form>
          </Card>

          {/* Security Settings */}
          <Card title="安全设置" className="border-gray-300 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <div className="flex items-center gap-3">
                  <SafetyCertificateOutlined className="text-xl text-green-500" />
                  <div>
                    <div className="font-medium">账户密码</div>
                    <div className="text-xs text-gray-500">
                      定期修改密码可以保护账户安全
                    </div>
                  </div>
                </div>
                <Button type="link">修改</Button>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <div className="flex items-center gap-3">
                  <PhoneOutlined className="text-xl text-blue-500" />
                  <div>
                    <div className="font-medium">手机绑定</div>
                    <div className="text-xs text-gray-500">
                      已绑定：138****8000
                    </div>
                  </div>
                </div>
                <Button type="link">换绑</Button>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <MailOutlined className="text-xl text-orange-500" />
                  <div>
                    <div className="font-medium">邮箱绑定</div>
                    <div className="text-xs text-gray-500">
                      已绑定：hr***@gugugaga.com
                    </div>
                  </div>
                </div>
                <Button type="link">换绑</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
