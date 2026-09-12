import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import useOrgData from "../../hooks/useOrgData";
import { Form, Input, Select, Button, Empty, message, Space } from "antd";
import {
  SearchOutlined,
  CoffeeOutlined,
  PrinterOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GlobalOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import useTables from "../../hooks/useTables";
import useItemStore from "../../hooks/useItemStore";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import { TABLE_STATUS, PAYMENT_MODE } from "../../utils/constant";
import { PATH_ORDERS, PATH_BILLING } from "../../routes/pathname";
import CategorySelecter from "../../../components/CategorySelecter";
import * as service from "../../../services";
import OrderInvoiceModal from "../../print/OrderInvoiceModal";
import KOT from "../../print/KOT";

const { Option } = Select;

const PosOrderComposer = () => {
  const { org_id, userData, permission } = useOrgData();
  const ordersPerm = permission?.orders;
  const canCreate = ordersPerm?.create ?? false;
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { tables = [] } = useTables();
  const [settings, setSettings] = useState({});
  const [catalogItems, catalogLoading] = useItemStore();
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [kotModalVisible, setKotModalVisible] = useState(false);
  const [createdOrderForPrint, setCreatedOrderForPrint] = useState(null);

  useEffect(() => {
    if (org_id) {
      service.getSettings(org_id).then((res) => {
        if (res) setSettings(res);
      });
    }
  }, [org_id]);

  const [form] = Form.useForm();
  const [selectedPosItems, setSelectedPosItems] = useState([]); // Array of { item, quantity }
  const [posSearchText, setPosSearchText] = useState("");
  const isPrintSubmitRef = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const availableTables = tables.filter(
      (t) => t.status === TABLE_STATUS.available,
    );
    if (availableTables.length > 0) {
      if (!form.getFieldValue("table_id")) {
        form.setFieldsValue({ table_id: availableTables[0].id });
      }
    } else {
      form.setFieldsValue({ table_id: "" });
    }
  }, [tables, form]);

  const handleAddPosItem = (item) => {
    setSelectedPosItems((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleRemovePosItem = (itemId) => {
    setSelectedPosItems(selectedPosItems.filter((i) => i.item.id !== itemId));
  };

  const handleAdjustPosQty = (itemId, delta) => {
    setSelectedPosItems((prev) =>
      prev
        .map((i) => {
          if (i.item.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean),
    );
  };

  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODE.unpaid); // Default to "Unpaid"

  const handleFormFinish = async (values) => {
    if (!canCreate) {
      message.error("You do not have permission to create orders.");
      return;
    }
    if (selectedPosItems.length === 0) {
      message.error("Please add at least one product to the order.");
      return;
    }

    const subtotal = selectedPosItems.reduce(
      (acc, curr) => acc + Number(curr.item.price || 0) * curr.quantity,
      0,
    );
    const hasGst = Boolean(
      userData?.gst_number && String(userData.gst_number).trim().length > 0,
    );
    const itemsPayload = selectedPosItems.map((i) => {
      const isItemGst =
        hasGst && i.item.gst_status !== false && String(i.item.gst_status) !== "false";
      const itemSubtotal = Number(i.item.price || 0) * i.quantity;
      const itemTax = isItemGst ? itemSubtotal * 0.05 : 0;
      return {
        id: i.item.id,
        name: i.item.name,
        price: i.item.price,
        quantity: i.quantity,
        category: i.item.category || "Food",
        gst_status: i.item.gst_status ?? true,
        tax: itemTax,
      };
    });
    const tax = itemsPayload.reduce((acc, curr) => acc + curr.tax, 0);
    const total = subtotal + tax;

    const tableId = values.table_id;
    const selectedTable = tables.find((t) => t.id === tableId);

    const isPaid = paymentMode && paymentMode !== PAYMENT_MODE.unpaid;

    const payload = {
      table_id: tableId || null,
      table_name: selectedTable ? selectedTable.table_name : "Takeaway",
      items: itemsPayload,
      subtotal,
      tax,
      service_charge: 0,
      discount: 0,
      total,
      status: "Preparing",
      payment_status: isPaid ? "Paid" : "Unpaid",
      payment_mode: isPaid ? paymentMode : PAYMENT_MODE.unpaid,
      payment_method: isPaid ? paymentMode : PAYMENT_MODE.unpaid,
    };

    try {
      const newOrder = await createOrder(payload);
      message.success(
        isPaid
          ? `POS order placed & paid via ${paymentMode}!`
          : "POS order placed successfully!"
      );
      form.resetFields();
      setSelectedPosItems([]);
      setPaymentMode(PAYMENT_MODE.unpaid);
      if (isPrintSubmitRef.current === "invoice") {
        setCreatedOrderForPrint(newOrder);
        setPrintModalVisible(true);
      } else {
        navigate(PATH_ORDERS);
      }
    } catch (err) {
      message.error("Failed to compose order");
      console.error(err);
    }
  };

  const handleOpenKotModal = () => {
    if (selectedPosItems.length === 0) {
      message.error("Please add at least one item to print KOT.");
      return;
    }
    const tableId = form.getFieldValue("table_id");
    const selectedTable = tables.find((t) => t.id === tableId);
    const tableName = selectedTable
      ? selectedTable.table_number
        ? `Table ${selectedTable.table_number} (${selectedTable.table_name})`
        : selectedTable.table_name
      : "Takeaway";

    const draftKotOrder = {
      order_number: `KOT-${Math.floor(100000 + Math.random() * 900000)}`,
      table_name: tableName,
      table_number: selectedTable?.table_number,
      items: selectedPosItems.map((i) => ({
        name: i.item.name,
        quantity: i.quantity,
      })),
      created_at: new Date().toISOString(),
    };

    setCreatedOrderForPrint(draftKotOrder);
    setKotModalVisible(true);
  };

  const menuFilteredCatalog = catalogItems?.filter(
    (item) =>
      item.status === true &&
      (selectedCategory === item.category_id || selectedCategory === "all") &&
      (item.name?.toLowerCase().includes(posSearchText.toLowerCase()) ||
        item.code?.toLowerCase().includes(posSearchText.toLowerCase())),
  );
  const subtotalSum = selectedPosItems.reduce(
    (acc, curr) => acc + Number(curr.item.price || 0) * curr.quantity,
    0,
  );
  const hasGst = Boolean(
    userData?.gst_number && String(userData.gst_number).trim().length > 0,
  );
  const taxSum = selectedPosItems.reduce((acc, curr) => {
    const isItemGst =
      hasGst && curr.item.gst_status !== false && String(curr.item.gst_status) !== "false";
    const itemSubtotal = Number(curr.item.price || 0) * curr.quantity;
    return acc + (isItemGst ? itemSubtotal * 0.05 : 0);
  }, 0);
  const grandTotal = subtotalSum + taxSum;

  const checkIsItemGst = (item) => {
    return (
      hasGst &&
      item?.gst_status !== false &&
      String(item?.gst_status) !== "false"
    );
  };

  return (
    <PageWrapper>
      <HeaderBox>
        <TabHeader title="POS New Order Composer" />
        <Button
          type="primary"
          onClick={() => navigate(PATH_ORDERS)}
          style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
        >
          Orders Listing
        </Button>
      </HeaderBox>
      <CategorySelecter

        onChange={handleCategoryFilter}
        value={selectedCategory}
      />

      <ComposerCard>
        <Form form={form} layout="vertical" onFinish={handleFormFinish}>
          <PosContainer>
            {/* Left Column - Selection Grid */}
            <PosLeftPanel>
              <FilterRow>
                <Form.Item
                  name="table_id"
                  label="Assign Dining Table"
                  rules={[
                    {
                      required: false,
                    },
                  ]}
                >
                  <Select
                    placeholder="Choose dining table"
                    style={{ height: 38, borderRadius: 8 }}
                    allowClear
                  >
                    <Option value="">Takeaway</Option>
                    {tables
                      .filter((t) => t.status === TABLE_STATUS.available)
                      ?.map((t) => (
                        <Option key={t.id} value={t.id}>
                          {t.table_name} ({t.capacity} seats) {t.table_number}{" "}
                          {t.section_name} {t.location}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Filter Menu">
                  <Input
                    placeholder="Filter menu dishes..."
                    prefix={<SearchOutlined />}
                    value={posSearchText}
                    onChange={(e) => setPosSearchText(e.target.value)}
                    style={{ height: 38, borderRadius: 8 }}
                  />
                </Form.Item>
              </FilterRow>

              <MenuGrid>
                {catalogLoading ? (
                  <p>Loading items catalog...</p>
                ) : menuFilteredCatalog?.length === 0 ? (
                  <Empty description="No menu items in catalog" />
                ) : (
                  menuFilteredCatalog?.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      onClick={() => handleAddPosItem(item)}
                    >
                      {item.image ? (
                        <MenuImg src={item.image} alt={item.name} />
                      ) : (
                        <MenuAvatar>{item.name[0]}</MenuAvatar>
                      )}
                      <CodeBadge>{item.code}</CodeBadge>

                      <MenuCardContent>
                        <MenuMeta>
                          <MenuName>{item.name}</MenuName>

                          <MenuPrice>
                            {settings.currency || "Rs."} {item.price}
                          </MenuPrice>
                        </MenuMeta>
                      </MenuCardContent>
                    </MenuItemCard>
                  ))
                )}
              </MenuGrid>
            </PosLeftPanel>

            {/* Right Column - Composition List */}
            <PosRightPanel>
              <ComposerTitle>Composition Ticket</ComposerTitle>
              <ComposerList>
                {selectedPosItems.length === 0 ? (
                  <ComposerEmpty>
                    <CoffeeOutlined
                      style={{
                        fontSize: 40,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                    <p>
                      No composed dishes yet.
                      <br />
                      Click items on the left to add.
                    </p>
                  </ComposerEmpty>
                ) : (
                  selectedPosItems.map(({ item, quantity }) => (
                    <ComposedItem key={item.id}>
                      <div>
                        <CompNameRow>
                          <CompName>{item.name}</CompName>
                          {hasGst && checkIsItemGst(item) && (
                            <GstText>(5% GST)</GstText>
                          )}
                        </CompNameRow>
                        <CompPrice>
                          {settings.currency || "Rs."} {item.price}
                        </CompPrice>
                      </div>
                      <QtyControls>
                        <Button
                          size="small"
                          onClick={() => handleAdjustPosQty(item.id, -1)}
                        >
                          -
                        </Button>
                        <span>{quantity}</span>
                        <Button
                          size="small"
                          onClick={() => handleAdjustPosQty(item.id, 1)}
                        >
                          +
                        </Button>
                      </QtyControls>
                    </ComposedItem>
                  ))
                )}
              </ComposerList>

              <ComposerSummary>
                <SummaryRow>
                  <span>Subtotal</span>
                  <span>
                    {settings.currency || "Rs."} {subtotalSum.toFixed(2)}
                  </span>
                </SummaryRow>
                {hasGst && (
                  <SummaryRow>
                    <span>GST (5%)</span>
                    <span>
                      {settings.currency || "Rs."} {taxSum.toFixed(2)}
                    </span>
                  </SummaryRow>
                )}
                <DashedLine />
                <SummaryRow
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "var(--color-primary)",
                  }}
                >
                  <span>Grand Total</span>
                  <span>
                    {settings.currency || "Rs."} {grandTotal.toFixed(2)}
                  </span>
                </SummaryRow>

                <PaymentSection>
                  <PaymentButtonGroup>
                    <PaymentOptionBtn
                      type={paymentMode === PAYMENT_MODE.unpaid ? "primary" : "default"}
                      htmlType="button"
                      $selected={paymentMode === PAYMENT_MODE.unpaid}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPaymentMode(PAYMENT_MODE.unpaid);
                      }}
                    >
                      <ClockCircleOutlined /> {PAYMENT_MODE.unpaid}
                    </PaymentOptionBtn>
                    <PaymentOptionBtn
                      type={paymentMode === PAYMENT_MODE.cash ? "primary" : "default"}
                      htmlType="button"
                      $selected={paymentMode === PAYMENT_MODE.cash}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPaymentMode((prev) =>
                          prev === PAYMENT_MODE.cash ? PAYMENT_MODE.unpaid : PAYMENT_MODE.cash
                        );
                      }}
                    >
                      <DollarOutlined /> {PAYMENT_MODE.cash}
                    </PaymentOptionBtn>
                    <PaymentOptionBtn
                      type={paymentMode === PAYMENT_MODE.card ? "primary" : "default"}
                      htmlType="button"
                      $selected={paymentMode === PAYMENT_MODE.card}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPaymentMode((prev) =>
                          prev === PAYMENT_MODE.card ? PAYMENT_MODE.unpaid : PAYMENT_MODE.card
                        );
                      }}
                    >
                      <CreditCardOutlined /> {PAYMENT_MODE.card}
                    </PaymentOptionBtn>
                    <PaymentOptionBtn
                      type={paymentMode === PAYMENT_MODE.online ? "primary" : "default"}
                      htmlType="button"
                      $selected={paymentMode === PAYMENT_MODE.online}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPaymentMode((prev) =>
                          prev === PAYMENT_MODE.online ? PAYMENT_MODE.unpaid : PAYMENT_MODE.online
                        );
                      }}
                    >
                      <GlobalOutlined /> {PAYMENT_MODE.online}
                    </PaymentOptionBtn>
                  </PaymentButtonGroup>
                </PaymentSection>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    width: "100%",
                    marginTop: 12,
                  }}
                >
                  <Button
                    type="primary"
                    block
                    htmlType="submit"
                    disabled={selectedPosItems.length === 0}
                    onClick={() => {
                      isPrintSubmitRef.current = false;
                    }}
                    style={{
                      flex: 1,
                      height: 42,
                      fontWeight: 700,
                      borderRadius: 10,
                      fontSize: 12,
                      padding: "0 4px",
                    }}
                  >
                    Place POS Order
                  </Button>
                  <Button
                    type="default"
                    block
                    htmlType="submit"
                    disabled={selectedPosItems.length === 0}
                    onClick={() => {
                      isPrintSubmitRef.current = "invoice";
                    }}
                    icon={<PrinterOutlined />}
                    style={{
                      flex: 1,
                      height: 42,
                      fontWeight: 700,
                      borderRadius: 10,
                      borderColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                      fontSize: 12,
                      padding: "0 4px",
                    }}
                  >
                    Place & Print Invoice
                  </Button>
                  <Button
                    type="default"
                    block
                    
                    disabled={selectedPosItems.length === 0}
                    onClick={handleOpenKotModal}
                    icon={<PrinterOutlined />}
                    style={{
                      flex: 1,
                      height: 42,
                      fontWeight: 700,
                      borderRadius: 10,
                      borderColor: "#ff9800",
                      color: "#d97706",
                      fontSize: 12,
                      padding: "0 4px",
                    }}
                  >
                    KOT
                  </Button>
                </div>
              </ComposerSummary>
            </PosRightPanel>
          </PosContainer>
        </Form>
      </ComposerCard>
      <OrderInvoiceModal
        visible={printModalVisible}
        onClose={() => setPrintModalVisible(false)}
        order={createdOrderForPrint}
        settings={settings}
      />
      <KOT
        visible={kotModalVisible}
        onClose={() => setKotModalVisible(false)}
        order={createdOrderForPrint}
        settings={settings}
      />

    </PageWrapper>
  );
};

export default PosOrderComposer;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;




const ComposerCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  padding: 14px;
  
`;
const CodeBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 17, 23, 0.7);
  backdrop-filter: blur(6px);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;
const PosContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 16px;
  height: calc(100vh - 100px);
  min-height: 520px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const PosLeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  :where(.css-dev-only-do-not-override-mncuj7).ant-form-item {
    margin-bottom: 0;
  }
`;



const FilterRow = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;

  & > * {
    flex: 1;
  }

  .ant-form-item {
    margin-bottom: 0;
  }

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: max-content;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
`;

const MenuItemCard = styled.div`
  position: relative;
  height: 100px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-fast);
  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }
`;

const MenuImg = styled.img`
  width: 100%;
  height: 50px;
  object-fit: cover;
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
`;

const MenuAvatar = styled.div`
  width: 100%;
  height: 50px;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 800;
`;

const MenuCardContent = styled.div`
  padding: 5px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MenuName = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuMeta = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start
  align-items: center;
`;

const MenuPrice = styled.strong`
  font-size: 10.5px;
  color: var(--color-text-primary);
`;

const PosRightPanel = styled.div`
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ComposerTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 10px;
  border-bottom: 1.5px solid var(--color-border);
  padding-bottom: 6px;
`;

const ComposerList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 4px;
`;

const ComposerEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  text-align: center;
  p {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
`;

const ComposedItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px;
  border-radius: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
`;

const CompNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const GstText = styled.span`
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-secondary);
`;

const GstTopBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background: ${(props) =>
    props.$applied ? "rgba(16, 185, 129, 0.85)" : "rgba(107, 114, 128, 0.85)"};
  backdrop-filter: blur(6px);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 9.5px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const CompName = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const CompPrice = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  span {
    font-size: 11.5px;
    font-weight: 700;
  }
  .ant-btn {
    width: 20px;
    height: 20px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
`;

const ComposerSummary = styled.div`
  margin-top: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 10px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const DashedLine = styled.div`
  border-top: 1px dashed var(--color-border);
  margin: 4px 0;
`;

const PaymentSection = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PaymentLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PaymentButtonGroup = styled.div`
  display: flex;
  gap: 6px;
  width: 100%;
`;

const PaymentOptionBtn = styled(Button)`
  flex: 1;
  height: 36px;
  font-size: 11.5px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s ease;

  ${(props) =>
    props.$selected &&
    `
    background-color: #10b981 !important;
    border-color: #10b981 !important;
    color: #ffffff !important;
    box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
  `}
`;

const PaidBadge = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 8px;
  padding: 5px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
`;

const PendingBadge = styled.div`
  font-size: 10.5px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 2px;
`;
