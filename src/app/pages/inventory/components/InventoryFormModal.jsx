import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, Select, Button } from "antd";

const { Option } = Select;

const UNITS = ["pcs", "kgs", "ltrs", "boxes", "bags", "bottles", "packets"];

const InventoryFormModal = ({ open, onCancel, onFinish, editingRecord }) => {
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
      console.error("InventoryFormModal submit error:", err);
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Inventory Item" : "Add Inventory Item"}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={420}
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
          name="item_name"
          label="Item Name"
          rules={[{ required: true, message: "Item name is required" }]}
        >
          <Input placeholder="e.g. Tomatoes" style={{ height: 38, borderRadius: 8 }} />
        </Form.Item>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Form.Item
            name="stock"
            label="Current Stock"
            rules={[{ required: true, message: "Stock is required" }]}
          >
            <InputNumber
              min={0}
              placeholder="0"
              style={{ width: "100%", height: 38, borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="min_level"
            label="Min Threshold"
            rules={[{ required: true, message: "Minimum level is required" }]}
          >
            <InputNumber
              min={0}
              placeholder="0"
              style={{ width: "100%", height: 38, borderRadius: 8 }}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="unit"
          label="Stock Unit"
          rules={[{ required: true, message: "Unit is required" }]}
        >
          <Select placeholder="Select unit" style={{ height: 38 }}>
            {UNITS.map((u) => <Option key={u} value={u}>{u}</Option>)}
          </Select>
        </Form.Item>

        <Button
          type="primary"
          block
          htmlType="submit"
          style={{ height: 40, borderRadius: 8, fontWeight: 600, marginTop: 4 }}
        >
          {isEditing ? "Update Item" : "Add Item"}
        </Button>
      </Form>
    </Modal>
  );
};

export default InventoryFormModal;
