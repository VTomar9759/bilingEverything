import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Row, Col, Divider } from "antd";
import styled from "styled-components";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import RolePermissions, { MODULE_CONFIG } from "./RolePermissions";

const DEFAULT_PERMISSIONS = Object.keys(MODULE_CONFIG).reduce((acc, key) => {
  if(key === "orders"){
    acc[key] = { view: true, create: true, update: true, delete: true };
  }else{
    acc[key] = { view: false, create: false, update: false, delete: false };
  }
  return acc;
}, {});

const AdminModal = ({
  open,
  onCancel,
  onFinish,
  editingAdmin,
  loading,
  orgId,
  createdBy,
}) => {
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  useEffect(() => {
    if (open) {
      if (editingAdmin) {
        form.setFieldsValue({
          name: editingAdmin.name || "",
          email: editingAdmin.email || "",
          org_id: editingAdmin.org_id || orgId || "",
          created_by: editingAdmin.created_by || createdBy || "",
        });
        setPermissions(
          editingAdmin.permissions || editingAdmin.permission || DEFAULT_PERMISSIONS
        );
      } else {
        form.resetFields();
        form.setFieldsValue({
          org_id: orgId || "",
          created_by: createdBy || "",
        });
        setPermissions(DEFAULT_PERMISSIONS);
      }
    }
  }, [open, editingAdmin, orgId, createdBy, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        role_type: "admin",
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
        org_id: values.org_id || orgId,
        created_by: values.created_by || createdBy,
        permissions,
        permission: permissions,
      };
      await onFinish(payload);
      form.resetFields();
    } catch (err) {
      console.log("Validation error:", err);
    }
  };

  return (
    <StyledModal
      title={editingAdmin ? "Edit Admin & Permissions" : "Create New Admin"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      okText={editingAdmin ? "Update Admin" : "Create Admin"}
      cancelText="Cancel"
      destroyOnClose
      width={560}
      centered
    >
      <Form form={form} layout="vertical">
        <Row gutter={12}>
          <Col xs={24}>
            <Form.Item
              name="name"
              label="Admin Name"
              rules={[
                { required: true, message: "Please enter the admin's name" },
                { min: 2, message: "Name must be at least 2 characters" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "var(--color-primary)" }} />}
                placeholder="e.g. John Doe"
                maxLength={60}
                disabled={!!editingAdmin}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={!editingAdmin ? 12 : 24}>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: "Please enter email address" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "var(--color-primary)" }} />}
                placeholder="admin@example.com"
                maxLength={80}
                disabled={!!editingAdmin}
              />
            </Form.Item>
          </Col>

          {!editingAdmin && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: "Please enter a password" },
                  { min: 6, message: "Minimum 6 characters required" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "var(--color-primary)" }} />}
                  placeholder="Set password"
                />
              </Form.Item>
            </Col>
          )}
        </Row>

        <Divider style={{ margin: "12px 0 16px 0" }} />

        {/* Module Permissions Section */}
        <RolePermissions
          permissions={permissions}
          editable={true}
          onChange={setPermissions}
          showTitle={true}
        />

        {/* Hidden Form Items so org_id and created_by are tracked in form state */}
        <Form.Item name="org_id" hidden />
        <Form.Item name="created_by" hidden />
      </Form>
    </StyledModal>
  );
};

export default AdminModal;

/* ─── Styled Components ─── */
const StyledModal = styled(Modal)`
  .ant-modal-content {
    border-radius: var(--radius-xl);
    padding: 24px;
  }
  .ant-modal-header {
    margin-bottom: 16px;
  }
  .ant-modal-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--color-text-primary);
  }
  .ant-form-item-label > label {
    font-size: 12px;
    font-weight: 600;
    color: #374151;
  }
  .ant-input-affix-wrapper,
  .ant-input,
  .ant-select-selector {
    border-radius: var(--radius-md) !important;
  }
`;

const MetaBox = styled.div`
  background: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
`;

const MetaLabel = styled.span`
  color: var(--color-text-muted);
  font-weight: 600;
`;

const MetaValue = styled.span`
  color: var(--color-text-primary);
  font-family: monospace;
  font-weight: 500;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
