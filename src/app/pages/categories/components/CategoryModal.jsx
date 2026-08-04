import React, { useEffect } from "react";
import { Modal, Form, Input, Button } from "antd";
import { FolderOpenOutlined } from "@ant-design/icons";

const CategoryModal = ({ open, onCancel, onFinish, editingCategory, categories = [], loading }) => {
  const [form] = Form.useForm();

  // Reset or set fields when modal visibility or editingCategory changes
  useEffect(() => {
    if (open) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name || "",
        });
      } else {
        form.resetFields();
      }
    }
  }, [editingCategory, open, form]);

  const handleSubmit = async (values) => {
    try {
      const trimmedName = values.name ? values.name.trim() : "";
      await onFinish({ name: trimmedName });
      form.resetFields();
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-primary)", fontWeight: 800 }}>
          <FolderOpenOutlined style={{ fontSize: 18 }} />
          <span>{editingCategory ? "Edit Category" : "Add Category"}</span>
        </div>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={400}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            { required: true, message: "Category name is required" },
            {
              validator: (_, value) => {
                if (value) {
                  const trimmed = value.trim();
                  if (!trimmed) {
                    return Promise.reject(new Error("Category name cannot be empty or whitespace only."));
                  }
                  const isDuplicate = categories.some(
                    (c) =>
                      c.name.toLowerCase() === trimmed.toLowerCase() &&
                      (!editingCategory || c.id !== editingCategory.id)
                  );
                  if (isDuplicate) {
                    return Promise.reject(new Error("A category with this name already exists."));
                  }
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            placeholder="Enter category name"
            style={{ height: 40, borderRadius: 8 }}
            maxLength={100}
            disabled={loading}
            autoFocus
          />
        </Form.Item>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <Button
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
            disabled={loading}
            style={{ borderRadius: 8, height: 38 }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={loading}
            style={{ borderRadius: 8, height: 38, fontWeight: 600 }}
          >
            {editingCategory ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CategoryModal;
