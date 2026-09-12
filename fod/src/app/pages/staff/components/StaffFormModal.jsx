import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";

const { Option } = Select;

const ROLES   = ["Chef", "Waiter", "Cashier", "Manager"];
const SHIFTS  = ["Morning", "Evening", "Night"];
const STATUSES = ["Active", "On Break", "Inactive"];

const StaffFormModal = ({ open, onCancel, onFinish, editingRecord }) => {
  const [form] = Form.useForm();
  const isEditing = !!editingRecord;

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue(editingRecord);
      } else {
        form.resetFields();
      }
    }
  }, [open, editingRecord, form]);

  const handleSubmit = async (values) => {
    try {
      await onFinish(values);
      form.resetFields();
    } catch (err) {
      console.error("StaffFormModal submit error:", err);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Staff Member" : "Add New Staff Member"}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={440}
      centered
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 8 }}
      >
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: "Name is required" }]}
        >
          <Input placeholder="e.g. Ravi Kumar" style={{ height: 38, borderRadius: 8 }} />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Role is required" }]}
          >
            <Select placeholder="Select role" style={{ height: 38 }}>
              {ROLES.map((r) => <Option key={r} value={r}>{r}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            name="shift"
            label="Shift"
            rules={[{ required: true, message: "Shift is required" }]}
          >
            <Select placeholder="Select shift" style={{ height: 38 }}>
              {SHIFTS.map((s) => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
        </div>

        <Form.Item
          name="status"
          label="Employment Status"
          rules={[{ required: true, message: "Status is required" }]}
        >
          <Select placeholder="Select status" style={{ height: 38 }}>
            {STATUSES.map((s) => <Option key={s} value={s}>{s}</Option>)}
          </Select>
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="+91 98765 43210" style={{ height: 38, borderRadius: 8 }} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ type: "email", message: "Enter a valid email" }]}
          >
            <Input placeholder="name@restaurant.com" style={{ height: 38, borderRadius: 8 }} />
          </Form.Item>
        </div>

        <Button
          type="primary"
          block
          htmlType="submit"
          style={{ height: 40, borderRadius: 8, fontWeight: 600, marginTop: 4 }}
        >
          {isEditing ? "Update Staff Member" : "Add Staff Member"}
        </Button>
      </Form>
    </Modal>
  );
};

export default StaffFormModal;
