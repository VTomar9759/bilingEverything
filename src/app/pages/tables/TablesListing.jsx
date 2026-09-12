import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Radio,
  Modal,
  message,
  Empty,
  Space,
  Popconfirm,
  Tooltip,
  Select,
} from "antd";
import {
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ClearOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import { PATH_BILLING, PATH_ORDERS } from "../../routes/pathname";
import useTables from "../../hooks/useTables";
import TableCard from "./components/TableCard";
import TableFormModal from "./components/TableFormModal";
import { getTABLE_STATUSColor } from "../../utils/common_function";
import useOrgData from "../../hooks/useOrgData";
import { TABLE_FLOORS, TABLE_STATUS } from "../../utils/constant";

const TablesListing = () => {
  const navigate = useNavigate();
  const { permission } = useOrgData();
  const tablesPerm = permission?.tables;

  const canCreate = tablesPerm?.create ?? false;
  const canUpdate = tablesPerm?.update ?? false;
  const canDelete = tablesPerm?.delete ?? false;

  const {
    tables,
    loading,
    refetch,
    addTable,
    updateTABLE_STATUS,
    updateTable,
    deleteTable,
    clearAllTables,
  } = useTables();

  const [activeFilter, setActiveFilter] = useState(TABLE_STATUS.all);
  const [activeFloor, setActiveFloor] = useState(TABLE_FLOORS.all);
  const [activeOrder, setActiveOrder] = useState(null);

  // Modal actions
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [editingTable, setEditingTable] = useState(null);

  // Active details modal
  const [selectedTable, setSelectedTable] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleTableClick = async (table) => {
    setSelectedTable(table);
    setDetailVisible(true);
  };

  const handleOpenAddModal = () => {
    if (!canCreate) {
      message.error("You do not have permission to add tables.");
      return;
    }
    setEditingTable(null);
    setTableModalVisible(true);
  };

  const handleOpenEditModal = () => {
    if (!canUpdate) {
      message.error("You do not have permission to edit tables.");
      return;
    }
    setEditingTable(selectedTable);
    setDetailVisible(false);
    setTableModalVisible(true);
  };

  const handleFormFinish = async (values) => {
    try {
      if (editingTable) {
        if (!canUpdate) {
          message.error("You do not have permission to update tables.");
          return;
        }
        await updateTable(editingTable.id, values);
        message.success(`Table ${values.table_number} modified successfully!`);
      } else {
        if (!canCreate) {
          message.error("You do not have permission to create tables.");
          return;
        }
        await addTable(values);
        message.success(`Table ${values.table_number} added successfully!`);
      }
      setTableModalVisible(false);
      setEditingTable(null);
      refetch();
    } catch (err) {
      message.error("Failed to commit table CRUD details");
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!selectedTable) return;
    if (!canUpdate) {
      message.error("You do not have permission to update table status.");
      return;
    }
    try {
      let orderId = selectedTable.current_order_id;
      if (
        status === TABLE_STATUS.available ||
        status === TABLE_STATUS.cleaning
      ) {
        orderId = null;
      }
      await updateTABLE_STATUS(selectedTable.id, status, orderId);
      message.success(`Table ${selectedTable.table_number} set to ${status}`);
      setDetailVisible(false);
      refetch();
    } catch (err) {
      message.error("Failed to update table status");
    }
  };

  const handleDeleteTable = async () => {
    if (!selectedTable) return;
    if (!canDelete) {
      message.error("You do not have permission to delete tables.");
      return;
    }
    try {
      await deleteTable(selectedTable.id);
      message.success(
        `Table ${selectedTable.table_number} deleted successfully`,
      );
      setDetailVisible(false);
      refetch();
    } catch (err) {
      message.error("Failed to delete table");
    }
  };

  const handleClearAll = async () => {
    if (!canDelete) {
      message.error("You do not have permission to clear tables.");
      return;
    }
    try {
      await clearAllTables();
      message.success("All tables cleared and set to available successfully!");
      refetch();
    } catch (err) {
      console.error("clearAllTables error:", err);
      message.error("Failed to clear tables");
    }
  };

  // Dynamic floor mapping
  const floors = [
    TABLE_FLOORS.all,
    ...new Set(tables.map((t) => t.floor_name)),
  ];

  // Filtering
  const filteredTables = tables.filter((t) => {
    const matchesStatus =
      activeFilter === TABLE_STATUS.all || t.status === activeFilter;
    const matchesFloor =
      activeFloor === TABLE_FLOORS.all || t.floor_name === activeFloor;
    return matchesStatus && matchesFloor;
  });

  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader title="Floor Dine-in Tables" />
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refetch}
            style={{ height: 32, width: 32, borderRadius: 8 }}
          />
          {canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenAddModal}
              style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
            >
              Add Table
            </Button>
          )}
         
          {canUpdate && (
            <Popconfirm
              title="Clear all tables?"
              description="Are you sure you want to set all tables status to available? This will clear all active orders from the tables."
              onConfirm={handleClearAll}
              okText="Clear All"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<ClearOutlined />}
                style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
              >
                Clear All
              </Button>
            </Popconfirm>
          )}
          
        </Space>
      </HeaderBox>

      {/* Combined Filter Bar */}
      <FilterBarContainer>
        <FilterLeftArea>
          <Radio.Group
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            buttonStyle="solid"
            size="middle"
          >
            <Radio.Button value={TABLE_STATUS.all}>
              All Tables ({tables.length})
            </Radio.Button>
            <Radio.Button value={TABLE_STATUS.available}>
              Available (
              {tables.filter((t) => t.status === TABLE_STATUS.available).length}
              )
            </Radio.Button>
            <Radio.Button value={TABLE_STATUS.occupied}>
              Occupied (
              {tables.filter((t) => t.status === TABLE_STATUS.occupied).length})
            </Radio.Button>
            <Radio.Button value={TABLE_STATUS.billed}>
              Billed (
              {tables.filter((t) => t.status === TABLE_STATUS.billed).length})
            </Radio.Button>
            <Radio.Button value={TABLE_STATUS.reserved}>
              Reserved (
              {tables.filter((t) => t.status === TABLE_STATUS.reserved).length})
            </Radio.Button>
            <Radio.Button value={TABLE_STATUS.cleaning}>
              Cleaning (
              {tables.filter((t) => t.status === TABLE_STATUS.cleaning).length})
            </Radio.Button>
          </Radio.Group>
        </FilterLeftArea>

        {floors?.length > 0 && (
          <FilterRightArea>
            <FilterLabel style={{ minWidth: "auto" }}>FLOOR LEVEL:</FilterLabel>
            <Select
              value={activeFloor}
              onChange={(value) => setActiveFloor(value)}
              style={{ width: 180 }}
              placeholder="Select Floor"
              size="middle"
            >
              {floors.map((f) => (
                <Select.Option key={f} value={f}>
                  {f} (
                  {f === TABLE_FLOORS.all
                    ? tables.length
                    : tables.filter((t) => t.floor_name === f).length}
                  )
                </Select.Option>
              ))}
            </Select>
          </FilterRightArea>
        )}
      </FilterBarContainer>

      {/* Tables Floor Grid */}
      {loading ? (
        <p>Loading table layouts...</p>
      ) : filteredTables.length === 0 ? (
        <Empty description="No tables match selected state" />
      ) : (
        <FloorGrid>
          {filteredTables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              onClick={() => handleTableClick(t)}
            />
          ))}
        </FloorGrid>
      )}

      {/* Add / Edit Table Modal */}
      <TableFormModal
        open={tableModalVisible}
        onCancel={() => {
          setTableModalVisible(false);
          setEditingTable(null);
        }}
        onFinish={handleFormFinish}
        editingTable={editingTable}
      />

      {/* Table Details & Operations Modal */}
      <Modal
        title={`Table Desk - ${selectedTable?.table_number}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={420}
        centered
        destroyOnClose
      >
        {selectedTable && (
          <DetailBox>
            <StatsPanel>
              <StatRow>
                <span>Current Status</span>
                <StatusTag $color={getTABLE_STATUSColor(selectedTable.status)}>
                  {selectedTable.status}
                </StatusTag>
              </StatRow>
              <StatRow>
                <span>Guests Capacity</span>
                <strong>
                  {selectedTable.seating_capacity || selectedTable.capacity}{" "}
                  Seats ({selectedTable.shape})
                </strong>
              </StatRow>
              <StatRow>
                <span>Floor Level</span>
                <strong>{selectedTable.floor_name || "Ground Floor"}</strong>
              </StatRow>
              {selectedTable.section_name && (
                <StatRow>
                  <span>Section Zone</span>
                  <strong>{selectedTable.section_name}</strong>
                </StatRow>
              )}
            </StatsPanel>

            {activeOrder ? (
              <ActiveOrderPanel>
                <OrderHeader>Active Order #{activeOrder.id}</OrderHeader>
                <OrderItemsList>
                  {activeOrder.items?.map((item, idx) => (
                    <ItemRow key={idx}>
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
                    </ItemRow>
                  ))}
                </OrderItemsList>
                <DashedDivider />
                <OrderTotalRow>
                  <span>Grand Total</span>
                  <strong>Rs. {activeOrder.total?.toFixed(2)}</strong>
                </OrderTotalRow>
              </ActiveOrderPanel>
            ) : (
              selectedTable.status === TABLE_STATUS.occupied && (
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  Order initialized, loading menu items...
                </p>
              )
            )}

            <ActionsArea>
              <ActionsTitleHeader>
                <ActionsTitle>Table Operations</ActionsTitle>
                <Space>
                  {canUpdate && (
                    <Tooltip title="Modify Details">
                      <Button
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={handleOpenEditModal}
                      />
                    </Tooltip>
                  )}
                  {canDelete && (
                    <Tooltip title="Delete Table">
                      <Popconfirm
                        title="Are you sure you want to delete this table?"
                        description="This action will remove the table completely."
                        onConfirm={handleDeleteTable}
                        okText="Delete"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                      >
                        <Button shape="circle" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Tooltip>
                  )}
                </Space>
              </ActionsTitleHeader>

              <Space direction="vertical" style={{ width: "100%" }} size={8}>
                {selectedTable.status === TABLE_STATUS.available && (
                  <>
                    <Button
                      type="primary"
                      block
                      icon={<CheckCircleOutlined />}
                      onClick={() => navigate(PATH_ORDERS)}
                    >
                      Check-in Seated Guest
                    </Button>
                    <Button
                      block
                      icon={<CalendarOutlined />}
                      style={{ color: "#8b5cf6", borderColor: "#8b5cf6" }}
                      onClick={() => handleStatusUpdate(TABLE_STATUS.reserved)}
                    >
                      Reserve Table
                    </Button>
                    <Button
                      block
                      style={{ color: "#06b6d4", borderColor: "#06b6d4" }}
                      onClick={() => handleStatusUpdate(TABLE_STATUS.cleaning)}
                    >
                      Mark as Cleaning
                    </Button>
                  </>
                )}

                {selectedTable.status === TABLE_STATUS.reserved && (
                  <Button
                    type="primary"
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleStatusUpdate(TABLE_STATUS.available)}
                  >
                    Release Reserved status
                  </Button>
                )}

                {selectedTable.status === TABLE_STATUS.occupied && (
                  <>
                    <Button
                      block
                      icon={<FileTextOutlined />}
                      style={{ color: "#f59e0b", borderColor: "#f59e0b" }}
                      onClick={() => navigate(PATH_BILLING, { state: { orderId: selectedTable.current_order_id } })}
                    >
                      Generate Bill / Invoice
                    </Button>
                    <Button
                      danger
                      block
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleStatusUpdate(TABLE_STATUS.available)}
                    >
                      Force Release Table
                    </Button>
                  </>
                )}

                {selectedTable.status === TABLE_STATUS.billed && (
                  <Button
                    type="primary"
                    block
                    icon={<FileTextOutlined />}
                    style={{ background: "#10b981", borderColor: "#10b981" }}
                    onClick={() => navigate(PATH_BILLING, { state: { orderId: selectedTable.current_order_id } })}
                  >
                    View / Print Invoice
                  </Button>
                )}

                {selectedTable.status === TABLE_STATUS.cleaning && (
                  <Button
                    type="primary"
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleStatusUpdate(TABLE_STATUS.available)}
                    style={{ background: "#06b6d4", borderColor: "#06b6d4" }}
                  >
                    Finish Cleaning (Set Available)
                  </Button>
                )}
              </Space>
            </ActionsArea>
          </DetailBox>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default TablesListing;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const FilterBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  transition: all 0.3s ease;
  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const FilterLeftArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterRightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-left: auto;

  @media (max-width: 720px) {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
`;

const FilterLabel = styled.span`
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
  min-width: 90px;
`;

const FloorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  width: 100%;
  margin-top: 10px;
`;

const DetailBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StatsPanel = styled.div`
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  strong {
    color: var(--color-text-primary);
  }
`;

const StatusTag = styled.span`
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  background: white;
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
`;

const ActiveOrderPanel = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px;
  background: #fbfcfd;
`;

const OrderHeader = styled.h4`
  font-family: var(--font-display);
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0 0 8px;
`;

const OrderItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--color-text-secondary);
`;

const DashedDivider = styled.div`
  border-top: 1px dashed var(--color-border);
  margin: 8px 0;
`;

const OrderTotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-primary);
`;

const ActionsArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionsTitleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 6px;
`;

const ActionsTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
`;
