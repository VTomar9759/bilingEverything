import React, { useState } from "react";
import styled from "styled-components";
import { Modal, Button, Form, Input, Select, DatePicker, message, Table, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from "@ant-design/icons";
import { addExpense, updateExpense, deleteExpense } from "../../../../services/expenseService";
import { formatCurrency } from "../utils/reportUtils";
import dayjs from "dayjs";

const EXPENSE_CATEGORIES = [
  "Raw Material",
  "Salary",
  "Rent",
  "Electricity",
  "Gas",
  "Packaging",
  "Maintenance",
  "Marketing",
  "Transportation",
  "Other",
];

const PAYMENT_METHODS = ["Cash", "Card", "UPI", "Bank Transfer", "Net Banking"];

const ExpenseManagement = ({ expenses = [], onRefresh, org_id, created_by, currency = "₹", permission = {} }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [categoryFilter, setCategoryFilter] = useState("All");

  const canEdit = permission.update !== false && permission.create !== false;

  const handleOpenModal = (expense = null) => {
    setEditingExpense(expense);
    if (expense) {
      form.setFieldsValue({
        expense_date: expense.expense_date ? dayjs(expense.expense_date) : dayjs(),
        category: expense.category || "Other",
        amount: expense.amount,
        payment_method: expense.payment_method || "Cash",
        description: expense.description || "",
        notes: expense.notes || "",
        receipt_url: expense.receipt_url || "",
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        expense_date: dayjs(),
        category: "Raw Material",
        payment_method: "Cash",
      });
    }
    setModalVisible(true);
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const payload = {
        expense_date: values.expense_date.toISOString(),
        category: values.category,
        amount: Number(values.amount || 0),
        payment_method: values.payment_method,
        description: values.description || "",
        notes: values.notes || "",
        receipt_url: values.receipt_url || "",
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
        message.success("Expense updated successfully!");
      } else {
        await addExpense(org_id, created_by, payload);
        message.success("Expense added successfully!");
      }
      setModalVisible(false);
      onRefresh();
    } catch (err) {
      console.error("Expense save error:", err);
      message.error("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExpense(id);
      message.success("Expense deleted successfully!");
      onRefresh();
    } catch (err) {
      console.error("Delete expense error:", err);
      message.error("Failed to delete expense.");
    }
  };

  const filteredExpenses = categoryFilter === "All"
    ? expenses
    : expenses.filter((e) => e.category === categoryFilter);

  const columns = [
    {
      title: "Date",
      dataIndex: "expense_date",
      key: "expense_date",
      render: (d) => (d ? new Date(d).toLocaleDateString() : "-"),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat) => <CategoryBadge>{cat || "Other"}</CategoryBadge>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc) => desc || "-",
    },
    {
      title: "Payment Method",
      dataIndex: "payment_method",
      key: "payment_method",
      render: (pm) => pm || "Cash",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amt) => (
        <AmountText>{formatCurrency(amt, currency)}</AmountText>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <ActionGroup>
          {record.receipt_url && (
            <IconButton
              title="View Receipt"
              onClick={() => window.open(record.receipt_url, "_blank")}
            >
              <PaperClipOutlined />
            </IconButton>
          )}
          {canEdit && (
            <IconButton title="Edit" onClick={() => handleOpenModal(record)}>
              <EditOutlined />
            </IconButton>
          )}
          {canEdit && (
            <Popconfirm
              title="Delete expense?"
              description="Are you sure you want to delete this expense?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <IconButton title="Delete" $danger>
                <DeleteOutlined />
              </IconButton>
            </Popconfirm>
          )}
        </ActionGroup>
      ),
    },
  ];

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Expense Management</Title>
          <SubTitle>Record and monitor operational expenses for your restaurant</SubTitle>
        </div>
        <ControlsGroup>
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 150 }}
            options={[
              { label: "All Categories", value: "All" },
              ...EXPENSE_CATEGORIES.map((cat) => ({ label: cat, value: cat })),
            ]}
          />
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenModal()}
              style={{ background: "#01514b" }}
            >
              Add Expense
            </Button>
          )}
        </ControlsGroup>
      </CardHeader>

      <Table
        dataSource={filteredExpenses}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
        size="small"
      />

      {/* Add / Edit Expense Modal */}
      <Modal
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="expense_date"
            label="Expense Date"
            rules={[{ required: true, message: "Please select expense date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select>
              {EXPENSE_CATEGORIES.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <Input type="number" prefix={currency} placeholder="0.00" />
          </Form.Item>

          <Form.Item
            name="payment_method"
            label="Payment Method"
            rules={[{ required: true, message: "Please select payment method" }]}
          >
            <Select>
              {PAYMENT_METHODS.map((pm) => (
                <Select.Option key={pm} value={pm}>
                  {pm}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input placeholder="Short summary of expense" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item name="receipt_url" label="Receipt / Attachment URL">
            <Input placeholder="https://example.com/receipt.pdf" />
          </Form.Item>

          <FormActions>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading} style={{ background: "#01514b" }}>
              {editingExpense ? "Update Expense" : "Save Expense"}
            </Button>
          </FormActions>
        </Form>
      </Modal>
    </CardContainer>
  );
};

export default ExpenseManagement;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const SubTitle = styled.p`
  font-size: 11.5px;
  color: #64748b;
  margin: 2px 0 0 0;
`;

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const CategoryBadge = styled.span`
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
`;

const AmountText = styled.span`
  font-weight: 700;
  color: #ef4444;
  font-size: 12.5px;
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const IconButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ $danger }) => ($danger ? "#ef4444" : "#01514b")};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fef2f2" : "#f0fdf4")};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;
