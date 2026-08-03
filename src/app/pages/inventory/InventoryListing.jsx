import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { Button, Input, Table, Space, Tooltip, Popconfirm, Empty, message } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  MinusOutlined,
  InboxOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useInventory from "../../hooks/useInventory";
import InventoryFormModal from "./components/InventoryFormModal";

const InventoryListing = () => {
  const { inventory, loading, addInventoryItem, adjustStock, deleteInventoryItem } = useInventory();

  const [searchText, setSearchText]       = useState("");
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  /* ── derived stats ── */
  const lowStockCount = inventory.filter((i) => i.stock <= i.min_level).length;

  /* ── search filter ── */
  const filtered = inventory.filter((i) =>
    i.item_name?.toLowerCase().includes(searchText.toLowerCase())
  );

  /* ── handlers ── */
  const handleOpenAdd = () => { setEditingRecord(null); setModalOpen(true); };

  const handleOpenEdit = (record) => { setEditingRecord(record); setModalOpen(true); };

  const handleFormFinish = async (values) => {
    try {
      if (editingRecord) {
        // adjust stock delta if user changed the number
        const delta = (values.stock ?? editingRecord.stock) - editingRecord.stock;
        if (delta !== 0) await adjustStock(editingRecord.id, delta);
        message.success("Inventory item updated!");
      } else {
        await addInventoryItem(values);
        message.success("Inventory item added!");
      }
      setModalOpen(false);
      setEditingRecord(null);
    } catch {
      message.error("Operation failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryItem(id);
      message.success("Item removed from inventory.");
    } catch {
      message.error("Failed to delete inventory item.");
    }
  };

  const handleAdjust = async (id, amount) => {
    try {
      await adjustStock(id, amount);
      message.success(`Stock ${amount > 0 ? "increased" : "decreased"} by ${Math.abs(amount)}`);
    } catch {
      message.error("Failed to adjust stock.");
    }
  };

  /* ── columns ── */
  const columns = [
    {
      title: "Item Name",
      dataIndex: "item_name",
      key: "item_name",
      render: (n) => <strong>{n}</strong>,
    },
    {
      title: "Stock Qty",
      key: "stock",
      render: (_, r) => (
        <StockCell $low={r.stock <= r.min_level}>
          {r.stock <= r.min_level && <WarningOutlined style={{ marginRight: 4 }} />}
          {r.stock} {r.unit}
        </StockCell>
      ),
    },
    {
      title: "Min Threshold",
      key: "min_level",
      render: (_, r) => <span style={{ color: "var(--color-text-muted)" }}>{r.min_level} {r.unit}</span>,
    },
    {
      title: "Status",
      key: "alert",
      render: (_, r) =>
        r.stock <= r.min_level ? (
          <AlertBadge $danger>
            <WarningOutlined style={{ marginRight: 4 }} /> LOW STOCK
          </AlertBadge>
        ) : (
          <AlertBadge>
            <CheckCircleOutlined style={{ marginRight: 4 }} /> OK
          </AlertBadge>
        ),
    },
    {
      title: "Adjust",
      key: "adjust",
      render: (_, r) => (
        <Space size={6}>
          <Tooltip title="Remove 1">
            <AdjBtn onClick={() => handleAdjust(r.id, -1)}><MinusOutlined /></AdjBtn>
          </Tooltip>
          <Tooltip title="Add 10">
            <AdjBtn $add onClick={() => handleAdjust(r.id, 10)}>+10</AdjBtn>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 90,
      render: (_, r) => (
        <Space size={6}>
          <Tooltip title="Edit">
            <ActionBtn onClick={() => handleOpenEdit(r)}><EditOutlined /></ActionBtn>
          </Tooltip>
          <Popconfirm
            title="Delete this inventory item?"
            onConfirm={() => handleDelete(r.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Tooltip title="Delete">
              <ActionBtn $danger><DeleteOutlined /></ActionBtn>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderBox>
        <TabHeader
          breadcrumb={["Dashboard", "Inventory"]}
          title="Inventory Catalog"
          subtitle={`${inventory.length} items tracked · ${lowStockCount} low stock alert${lowStockCount !== 1 ? "s" : ""}`}
        />
        <HeadActions>
          <Input
            placeholder="Search inventory..."
            prefix={<SearchOutlined style={{ color: "var(--color-text-secondary)" }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 180, height: 30, borderRadius: 6 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenAdd}
            style={{ height: 30, fontWeight: 600, borderRadius: 6 }}
          >
            Add Item
          </Button>
        </HeadActions>
      </HeaderBox>

      {/* Low-stock summary banner */}
      {lowStockCount > 0 && (
        <AlertBanner>
          <WarningOutlined />
          <strong>{lowStockCount}</strong> item{lowStockCount > 1 ? "s are" : " is"} below minimum stock threshold — please restock soon.
        </AlertBanner>
      )}

      {/* Table */}
      <PanelCard>
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <Empty icon={<InboxOutlined />} description="No inventory items found" /> }}
          rowClassName={(r) => (r.stock <= r.min_level ? "low-stock-row" : "")}
        />
      </PanelCard>

      {/* Add / Edit Modal */}
      <InventoryFormModal
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingRecord(null); }}
        onFinish={handleFormFinish}
        editingRecord={editingRecord}
      />
    </PageWrapper>
  );
};

export default InventoryListing;

/* ─── Animations ─── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.3s ease;
`;

const HeadActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PanelCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  padding: 20px 24px;
  animation: ${fadeIn} 0.35s ease;

  .low-stock-row td {
    background: rgba(239, 68, 68, 0.03) !important;
  }
`;

const StockCell = styled.span`
  font-weight: 700;
  color: ${({ $low }) => ($low ? "#ef4444" : "var(--color-text-primary)")};
  display: inline-flex;
  align-items: center;
`;

const AlertBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 1.5px 8px;
  border-radius: 999px;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  background: ${({ $danger }) => ($danger ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)")};
  color: ${({ $danger }) => ($danger ? "#ef4444" : "#10b981")};
  border: 1px solid ${({ $danger }) => ($danger ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)")};
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9.5px 14.5px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.18);
  border-radius: var(--radius-lg);
  font-size: 11.5px;
  color: #dc2626;
  animation: ${fadeIn} 0.3s ease;

  strong { margin: 0 2px; }
`;

const AdjBtn = styled.button`
  height: 22px;
  padding: 0 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: ${({ $add }) => ($add ? "rgba(16,185,129,0.08)" : "var(--color-bg)")};
  color: ${({ $add }) => ($add ? "#10b981" : "var(--color-text-secondary)")};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  &:hover {
    background: ${({ $add }) => ($add ? "rgba(16,185,129,0.14)" : "var(--color-primary-50)")};
    border-color: ${({ $add }) => ($add ? "#10b981" : "var(--color-primary-100)")};
    color: ${({ $add }) => ($add ? "#059669" : "var(--color-primary)")};
  }
`;

const ActionBtn = styled.button`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-text-secondary)")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all var(--transition-fast);
  &:hover {
    background: ${({ $danger }) => ($danger ? "#fff5f5" : "var(--color-primary-50)")};
    border-color: ${({ $danger }) => ($danger ? "#fecaca" : "var(--color-primary-100)")};
    color: ${({ $danger }) => ($danger ? "#dc2626" : "var(--color-primary)")};
    transform: scale(1.06);
  }
`;
