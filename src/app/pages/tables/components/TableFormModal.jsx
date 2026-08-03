import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  Row,
  Col,
} from "antd";
import { floorOptions } from "../../../utils/constOption";

const { Option } = Select;

const TableFormModal = ({ open, onCancel, onFinish, editingTable }) => {
  const [form] = Form.useForm();

  // Load values if in editing mode
  useEffect(() => {
    if (editingTable) {
      form.setFieldsValue({
        table_number: editingTable.table_number || "",
        table_name: editingTable.table_name || editingTable.name || "",
        seating_capacity:
          editingTable.seating_capacity || editingTable.capacity || 4,
        floor_name: editingTable.floor_name || "Ground Floor",
        section_name: editingTable.section_name || "",
        shape: editingTable.shape || "circle",
        color_code: editingTable.color_code || "emerald",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        floor_name: "Ground Floor",
        shape: "circle",
        color_code: "emerald",
        seating_capacity: 4,
      });
    }
  }, [editingTable, open, form]);

  const handleSubmit = async (values) => {
    try {
      await onFinish(values);
      form.resetFields();
    } catch (err) {
      console.error("Form submit error:", err);
    }
  };

  return (
    <Modal
      title={
        editingTable
          ? `Modify Dining Table - ${editingTable.table_number}`
          : "Add Floor Dining Table"
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      width={480}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="table_number"
              label="Table Number (Code)"
              rules={[
                {
                  required: true,
                  message: "Please input table number (e.g. T7)",
                },
              ]}
            >
              <Input
                placeholder="e.g. T7"
                style={{ height: 38, borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="table_name"
              label="Table Name / Label"
              rules={[{ required: true, message: "Please input label" }]}
            >
              <Input
                placeholder="e.g. Table Seven"
                style={{ height: 38, borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="floor_name"
              label="Floor Location"
              rules={[{ required: true, message: "Select floor level" }]}
            >
              <Select style={{ height: 38 }} placeholder="Select floor">
                {floorOptions.map((floor) => (
                  <Option key={floor.value} value={floor.value}>
                    {floor.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="section_name" label="Section Zone">
              <Input
                placeholder="e.g. Window, VIP, Center"
                style={{ height: 38, borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="seating_capacity"
              label="Capacity (Guests)"
              rules={[{ required: true, message: "Guest count is required" }]}
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: "100%", height: 38, borderRadius: 8 }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="shape"
              label="Table Layout Shape"
              rules={[{ required: true }]}
            >
              <Select style={{ height: 38 }}>
                <Option value="circle">Circle (Round Table)</Option>
                <Option value="square">Square Table</Option>
                <Option value="rectangle">Rectangle (Wider Desk)</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="color_code"
          label="Visual Accent Theme"
          rules={[{ required: true }]}
        >
          <Select style={{ height: 38 }}>
            <Option value="emerald">💚 Emerald Mint (Green Theme)</Option>
            <Option value="cobalt">💙 Cobalt Ocean (Blue Theme)</Option>
            <Option value="amethyst">💜 Amethyst Sky (Purple Theme)</Option>
            <Option value="amber">💛 Amber Glow (Orange Theme)</Option>
            <Option value="crimson">❤️ Crimson Rose (Red Theme)</Option>
            <Option value="teal">🩵 Teal Wave (Cyan Theme)</Option>
          </Select>
        </Form.Item>

        <Button
          type="primary"
          block
          htmlType="submit"
          style={{
            height: 42,
            borderRadius: 8,
            marginTop: 12,
            fontWeight: 700,
          }}
        >
          {editingTable
            ? "Save Dining Table Changes"
            : "Create Floor Dining Table"}
        </Button>
      </Form>
    </Modal>
  );
};

export default TableFormModal;
