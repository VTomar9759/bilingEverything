import React, { useState, useEffect } from "react";
import styled from "styled-components";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  message,
  Space,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import TableComponent from "../../../components/tableComponents";
import {
  GlassPageWrapper,
  GlassCard,
  PremiumButton,
  GlassTag,
} from "../../../components/ui/PremiumWrappers";

const { Option } = Select;

// Database configurations, schemas and inputs mapping
const TABLES_CONFIG = {
  items: {
    label: "Items Catalog Catalog",
    tableName: "items",
    fields: [
      { name: "name", label: "Name", type: "string", required: true },
      { name: "code", label: "Product Code", type: "string", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: ["Electronics", "Fashion", "Home", "Food", "Other"],
        required: true,
      },
      { name: "price", label: "Price (Rs.)", type: "number", required: true },
      { name: "title", label: "Short Title", type: "string", required: false },
      {
        name: "description",
        label: "Description",
        type: "text",
        required: false,
      },
    ],
    displayColumns: (onEdit, onDelete) => [
      {
        title: "Code",
        dataIndex: "code",
        key: "code",
        render: (c) => <CodeText>{c}</CodeText>,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (n) => <strong>{n}</strong>,
      },
      {
        title: "Category",
        dataIndex: "category",
        key: "category",
        render: (cat) => <GlassTag color="purple">{cat}</GlassTag>,
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (p) => <strong>Rs. {p?.toLocaleString("en-IN")}</strong>,
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (t) => t || "-",
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, record) => (
          <Space size={8}>
            <Tooltip title="Edit">
              <ActionButton onClick={() => onEdit(record)}>
                <EditOutlined />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete this item?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <ActionButton $danger>
                  <DeleteOutlined />
                </ActionButton>
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
  },
  restaurant_tables: {
    label: "Dine-in Floor Tables",
    tableName: "restaurant_tables",
    fields: [
      { name: "name", label: "Table Name", type: "string", required: true },
      {
        name: "capacity",
        label: "Seating Capacity",
        type: "number",
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Available", "Occupied", "Reserved", "Billed"],
        required: true,
      },
    ],
    displayColumns: (onEdit, onDelete) => [
      {
        title: "Table",
        dataIndex: "name",
        key: "name",
        render: (n) => <strong>{n}</strong>,
      },
      {
        title: "Capacity",
        dataIndex: "capacity",
        key: "capacity",
        render: (c) => <span>{c} Seats</span>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          let col = "default";
          if (status === "Available") col = "green";
          if (status === "Occupied") col = "blue";
          if (status === "Reserved") col = "purple";
          if (status === "Billed") col = "orange";
          return <GlassTag color={col}>{status}</GlassTag>;
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, record) => (
          <Space size={8}>
            <Tooltip title="Edit">
              <ActionButton onClick={() => onEdit(record)}>
                <EditOutlined />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete this table?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <ActionButton $danger>
                  <DeleteOutlined />
                </ActionButton>
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
  },
  orders: {
    label: "Customer Orders",
    tableName: "orders",
    fields: [
      {
        name: "table_name",
        label: "Table Name",
        type: "string",
        required: false,
      },
      { name: "subtotal", label: "Subtotal", type: "number", required: true },
      { name: "discount", label: "Discount", type: "number", required: false },
      { name: "tax", label: "Tax", type: "number", required: true },
      {
        name: "service_charge",
        label: "Service Charge",
        type: "number",
        required: false,
      },
      { name: "total", label: "Total Amount", type: "number", required: true },
      {
        name: "status",
        label: "Order Status",
        type: "select",
        options: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
        required: true,
      },
      {
        name: "payment_status",
        label: "Payment Status",
        type: "select",
        options: ["Unpaid", "Paid"],
        required: true,
      },
    ],
    displayColumns: (onEdit, onDelete) => [
      {
        title: "Order ID",
        dataIndex: "id",
        key: "id",
        render: (id) => (
          <strong style={{ color: "var(--color-primary-light)" }}>#{id}</strong>
        ),
      },
      {
        title: "Table",
        dataIndex: "table_name",
        key: "table_name",
        render: (n) => n || "Takeaway",
      },
      {
        title: "Total",
        dataIndex: "total",
        key: "total",
        render: (t) => <strong>Rs. {t?.toFixed(2)}</strong>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          let col = "default";
          if (status === "Pending") col = "orange";
          if (status === "Preparing") col = "blue";
          if (status === "Ready") col = "green";
          if (status === "Cancelled") col = "red";
          return <GlassTag color={col}>{status}</GlassTag>;
        },
      },
      {
        title: "Payment",
        dataIndex: "payment_status",
        key: "payment_status",
        render: (status) => (
          <GlassTag color={status === "Paid" ? "green" : "red"}>
            {status}
          </GlassTag>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, record) => (
          <Space size={8}>
            <Tooltip title="Edit">
              <ActionButton onClick={() => onEdit(record)}>
                <EditOutlined />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete this order ticket?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <ActionButton $danger>
                  <DeleteOutlined />
                </ActionButton>
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
  },
  restaurant_staff: {
    label: "Restaurant Staff",
    tableName: "restaurant_staff",
    fields: [
      { name: "name", label: "Staff Name", type: "string", required: true },
      {
        name: "role",
        label: "Role",
        type: "select",
        options: ["Chef", "Waiter", "Cashier", "Manager"],
        required: true,
      },
      {
        name: "status",
        label: "Status",
        type: "select",
        options: ["Active", "On Break", "Inactive"],
        required: true,
      },
      { name: "phone", label: "Phone Number", type: "string", required: false },
      {
        name: "email",
        label: "Email Address",
        type: "string",
        required: false,
      },
      {
        name: "shift",
        label: "Shift",
        type: "select",
        options: ["Morning", "Evening", "Night"],
        required: true,
      },
    ],
    displayColumns: (onEdit, onDelete) => [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        render: (n) => <strong>{n}</strong>,
      },
      {
        title: "Role",
        dataIndex: "role",
        key: "role",
        render: (r) => <GlassTag color="blue">{r}</GlassTag>,
      },
      { title: "Shift", dataIndex: "shift", key: "shift" },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <GlassTag
            color={
              status === "Active"
                ? "green"
                : status === "On Break"
                  ? "orange"
                  : "red"
            }
          >
            {status}
          </GlassTag>
        ),
      },
      { title: "Contact", dataIndex: "phone", key: "phone" },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, record) => (
          <Space size={8}>
            <Tooltip title="Edit">
              <ActionButton onClick={() => onEdit(record)}>
                <EditOutlined />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Remove this staff member?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <ActionButton $danger>
                  <DeleteOutlined />
                </ActionButton>
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
  },
  restaurant_inventory: {
    label: "Inventory Roster",
    tableName: "restaurant_inventory",
    fields: [
      { name: "item_name", label: "Item Name", type: "string", required: true },
      {
        name: "stock",
        label: "Available Stock",
        type: "number",
        required: true,
      },
      {
        name: "min_level",
        label: "Minimum Level Threshold",
        type: "number",
        required: true,
      },
      {
        name: "unit",
        label: "Stock Unit (e.g. pcs, kgs)",
        type: "string",
        required: true,
      },
    ],
    displayColumns: (onEdit, onDelete) => [
      {
        title: "Item Name",
        dataIndex: "item_name",
        key: "item_name",
        render: (n) => <strong>{n}</strong>,
      },
      {
        title: "Stock Quantity",
        key: "stock",
        render: (_, record) => (
          <strong
            style={{
              color:
                record.stock <= record.min_level
                  ? "#ef4444"
                  : "var(--color-text-primary)",
            }}
          >
            {record.stock} {record.unit}
          </strong>
        ),
      },
      {
        title: "Min Threshold",
        key: "min_level",
        render: (_, r) => (
          <span>
            {r.min_level} {r.unit}
          </span>
        ),
      },
      {
        title: "Stock Alert",
        key: "alert",
        render: (_, record) =>
          record.stock <= record.min_level ? (
            <GlassTag color="red">LOW STOCK ALERT</GlassTag>
          ) : (
            <GlassTag color="green">SUFFICIENT STOCK</GlassTag>
          ),
      },
      {
        title: "Actions",
        key: "actions",
        width: 100,
        render: (_, record) => (
          <Space size={8}>
            <Tooltip title="Edit">
              <ActionButton onClick={() => onEdit(record)}>
                <EditOutlined />
              </ActionButton>
            </Tooltip>
            <Tooltip title="Delete">
              <Popconfirm
                title="Delete this stock line?"
                onConfirm={() => onDelete(record.id)}
                okText="Delete"
                cancelText="Cancel"
              >
                <ActionButton $danger>
                  <DeleteOutlined />
                </ActionButton>
              </Popconfirm>
            </Tooltip>
          </Space>
        ),
      },
    ],
  },
};

const DynamicManager = () => {
  const [selectedKey, setSelectedKey] = useState("items");
  const config = TABLES_CONFIG[selectedKey];

  // Dynamic CRUD operations using custom React hook
  const { data, loading, addRow, updateRow, deleteRow, refetch } =
    useSupabaseTable(config.tableName);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setPage(1);
  }, [selectedKey]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteRow(id);
      message.success("Record deleted successfully from Supabase!");
    } catch {
      message.error("Failed to delete record.");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        // Update
        await updateRow(editingRecord.id, values);
        message.success("Record updated successfully in Supabase!");
      } else {
        // Create
        await addRow(values);
        message.success("New record inserted successfully into Supabase!");
      }
      setModalVisible(false);
      form.resetFields();
    } catch (err) {
      message.error(err.message || "Failed to commit transaction.");
    }
  };

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <GlassPageWrapper>
      {/* Tab Header bar */}
      <HeaderRow>
        <TabHeader
          breadcrumb={["Dashboard", "Database Admin"]}
          title="Supabase Dynamic Table Manager"
          subtitle="Direct real-time administration panel of all restaurant tenant database systems."
        />
        <ControlsArea>
          <SelectSelector value={selectedKey} onChange={setSelectedKey}>
            {Object.entries(TABLES_CONFIG).map(([key, item]) => (
              <Option key={key} value={key}>
                {item.label} ({item.tableName})
              </Option>
            ))}
          </SelectSelector>

          <PremiumButton icon={<ReloadOutlined />} onClick={refetch} $secondary>
            Sync
          </PremiumButton>

          <PremiumButton icon={<PlusOutlined />} onClick={handleOpenAdd}>
            Insert Row
          </PremiumButton>
        </ControlsArea>
      </HeaderRow>

      {/* Main Table view */}
      <GlassCard
        title={`${config.label} Records List (${data.length} total rows)`}
      >
        <TableWrapper>
          <TableComponent
            loading={loading}
            columns={config.displayColumns(handleOpenEdit, handleDelete)}
            data={paginatedData.map((d, index) => ({
              key: d.id || `row-${index}`,
              ...d,
            }))}
            pagination={{
              page,
              pageSize,
              totalPages,
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
            }}
          />
        </TableWrapper>
      </GlassCard>

      {/* Generic Modal Form Editor */}
      <Modal
        title={
          <ModalTitle>
            <DatabaseOutlined />
            <span>
              {editingRecord
                ? `Modify ${config.label} Row`
                : `Insert New ${config.label} Row`}
            </span>
          </ModalTitle>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={480}
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <FormFieldsScroll>
            {config.fields.map((field) => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={[
                  {
                    required: field.required,
                    message: `${field.label} is required`,
                  },
                ]}
              >
                {field.type === "number" ? (
                  <InputNumber
                    style={{ width: "100%", height: 38, borderRadius: 8 }}
                    placeholder={`Enter ${field.label}...`}
                  />
                ) : field.type === "select" ? (
                  <Select
                    style={{ height: 38 }}
                    placeholder={`Choose ${field.label}...`}
                  >
                    {field.options.map((opt) => (
                      <Option key={opt} value={opt}>
                        {opt}
                      </Option>
                    ))}
                  </Select>
                ) : field.type === "text" ? (
                  <Input.TextArea
                    rows={4}
                    style={{ borderRadius: 8 }}
                    placeholder={`Enter ${field.label}...`}
                  />
                ) : (
                  <Input
                    style={{ height: 38, borderRadius: 8 }}
                    placeholder={`Enter ${field.label}...`}
                  />
                )}
              </Form.Item>
            ))}
          </FormFieldsScroll>
          <ModalActions>
            <PremiumButton $secondary onClick={() => setModalVisible(false)}>
              Discard
            </PremiumButton>
            <PremiumButton htmlType="submit">Commit Changes</PremiumButton>
          </ModalActions>
        </Form>
      </Modal>
    </GlassPageWrapper>
  );
};

export default DynamicManager;

/* ─── Styled Components ─── */
const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const ControlsArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }
`;

const SelectSelector = styled(Select)`
  width: 250px;

  .ant-select-selector {
    height: 38px !important;
    padding: 3px 12px !important;
    border-radius: var(--radius-md) !important;
    border-color: var(--color-border) !important;
    font-weight: 600;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const ActionButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: white;
  color: ${({ $danger }) =>
    $danger ? "#ef4444" : "var(--color-text-secondary)"};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all var(--transition-fast);

  &:hover {
    background: ${({ $danger }) =>
      $danger ? "#fff5f5" : "var(--color-primary-50)"};
    border-color: ${({ $danger }) =>
      $danger ? "#fecaca" : "var(--color-primary-100)"};
    color: ${({ $danger }) => ($danger ? "#dc2626" : "var(--color-primary)")};
    transform: scale(1.06);
  }
`;

const CodeText = styled.code`
  background: var(--color-bg);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 11.5px;
  font-family: Consolas, monospace;
  color: var(--color-primary);
  font-weight: 700;
  border: 1px solid var(--color-border);
`;

const TableWrapper = styled.div`
  .ant-table-wrapper {
    margin: -20px !important;
  }
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primary);
`;

const FormFieldsScroll = styled.div`
  max-height: 380px;
  overflow-y: auto;
  padding-right: 6px;
  margin-bottom: 20px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1.5px solid var(--color-border);
  padding-top: 16px;
  margin-top: 12px;
`;
