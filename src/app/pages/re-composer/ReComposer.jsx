import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import useOrgData from "../../hooks/useOrgData";
import { Input, Select, Button, Empty, message, Spin, Space, Switch } from "antd";
import {
  SearchOutlined,
  CoffeeOutlined,
  PrinterOutlined,
  EditOutlined,
  SaveOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined,
  CreditCardOutlined,
  DollarOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import useOrderEdit from "../../hooks/useOrderEdit";
import useItemStore from "../../hooks/useItemStore";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import { PATH_BILLING } from "../../routes/pathname";
import { PAYMENT_MODE } from "../../utils/constant";
import CategorySelecter from "../../../components/CategorySelecter";
import * as service from "../../../services";
import OrderInvoiceModal from "../../print/OrderInvoiceModal";
import KOT from "../../print/KOT";
import { setShowCustomerDetails } from "../../store/slices/authSlices";

const { Option } = Select;

const OrderEditPage = () => {
  const { org_id, userData, permission, show_customer_details } = useOrgData();
  const ordersPerm = permission?.orders;
  const canUpdate = ordersPerm?.update ?? false;
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const orderId = location.state?.orderId;

  const { order, loading: orderLoading, fetchOrder, editItems } = useOrderEdit();
  const [settings, setSettings] = useState({});
  const [catalogItems, catalogLoading] = useItemStore();
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [kotModalVisible, setKotModalVisible] = useState(false);
  const [isKotCombined, setIsKotCombined] = useState(true);
  const [createdOrderForPrint, setCreatedOrderForPrint] = useState(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [isKotLoading, setIsKotLoading] = useState(false);
  const isKotLoadingRef = useRef(false);
  const [paymentMode, setPaymentMode] = useState(PAYMENT_MODE.unpaid);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  useEffect(() => {
    if (org_id) {
      service.getSettings(org_id).then((res) => {
        if (res) setSettings(res);
      });
    }
  }, [org_id]);

  // Fetch the order to edit
  useEffect(() => {
    if (org_id && orderId) {
      fetchOrder(orderId);
    }
  }, [org_id, orderId, fetchOrder]);

  const [selectedPosItems, setSelectedPosItems] = useState([]);
  const [posSearchText, setPosSearchText] = useState("");
  const isPrintSubmitRef = useRef(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [initialized, setInitialized] = useState(false);

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
  };

  // Pre-populate items and customer fields from fetched order
  useEffect(() => {
    if (order && !initialized) {
      if (order.items) {
        const mapped = order.items.map((item) => ({
          item: {
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            gst_status: item.gst_status,
            code: item.code || "",
            image: item.image || "",
          },
          quantity: item.quantity,
        }));
        setSelectedPosItems(mapped);
      }
      setCustomerName(order.customer_name || "");
      setCustomerPhone(order.customer_phone || "");
      setCustomerAddress(order.customer_address || "");
      if (order.payment_mode) {
        setPaymentMode(order.payment_mode);
      } else if (order.payment_status === "Paid") {
        setPaymentMode(PAYMENT_MODE.cash);
      } else {
        setPaymentMode(PAYMENT_MODE.unpaid);
      }
      if (order.customer_name || order.customer_phone || order.customer_address) {
        dispatch(setShowCustomerDetails(true));
      }
      setInitialized(true);
    }
  }, [order, initialized, dispatch]);

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

  const hasGst = Boolean(
    userData?.gst_number && String(userData.gst_number).trim().length > 0,
  );

  const handleSaveOrder = async () => {
    if (savingRef.current || isKotLoadingRef.current) return;
    if (!canUpdate) {
      message.error("You do not have permission to edit orders.");
      return;
    }
    if (selectedPosItems.length === 0) {
      message.error("Please add at least one product to the order.");
      return;
    }

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

    const isPaid = paymentMode && paymentMode !== PAYMENT_MODE.unpaid;

    const customerFields = {
      customer_name: customerName ? customerName.trim() : null,
      customer_phone: customerPhone ? customerPhone.trim() : null,
      customer_address: customerAddress ? customerAddress.trim() : null,
      payment_status: isPaid ? "Paid" : "Unpaid",
      payment_mode: isPaid ? paymentMode : PAYMENT_MODE.unpaid,
      payment_method: isPaid ? paymentMode : PAYMENT_MODE.unpaid,
    };

    savingRef.current = true;
    setSaving(true);
    try {
      const updatedOrder = await editItems(orderId, itemsPayload, customerFields);
      message.success("Order updated successfully!");

      if (isPrintSubmitRef.current === "invoice") {
        setCreatedOrderForPrint(updatedOrder || {
          ...order,
          items: itemsPayload,
          ...customerFields,
        });
        setPrintModalVisible(true);
      } else if (isPrintSubmitRef.current === "both") {
        setCreatedOrderForPrint(updatedOrder || {
          ...order,
          items: itemsPayload,
          ...customerFields,
        });
        setIsKotCombined(true);
        setPrintModalVisible(false);
        setKotModalVisible(true);
      } else {
        navigate(PATH_BILLING, {
          state: { orderId },
        });
      }
    } catch (err) {
      message.error("Failed to update order.");
      console.error(err);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleOpenKotModal = async () => {
    if (savingRef.current || isKotLoadingRef.current) return;
    if (selectedPosItems.length === 0) {
      message.error("Please add at least one item to print KOT.");
      return;
    }

    isKotLoadingRef.current = true;
    setIsKotLoading(true);
    try {
      const tableName = order?.table_name || "Takeaway";
      const draftKotOrder = {
        order_number: order?.order_number || `KOT-${Math.floor(100000 + Math.random() * 900000)}`,
        table_name: tableName,
        table_number: order?.table_number,
        customer_name: customerName ? customerName.trim() : null,
        customer_phone: customerPhone ? customerPhone.trim() : null,
        customer_address: customerAddress ? customerAddress.trim() : null,
        items: selectedPosItems.map((i) => ({
          name: i.item.name,
          quantity: i.quantity,
        })),
        created_at: new Date().toISOString(),
      };

      setCreatedOrderForPrint(draftKotOrder);
      setIsKotCombined(false);
      setKotModalVisible(true);
    } catch (err) {
      console.error(err);
    } finally {
      isKotLoadingRef.current = false;
      setIsKotLoading(false);
    }
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

  const orderTitle = order
    ? `Edit Order #${order.order_number || orderId}`
    : "Edit Order";

  if (!orderId) {
    return (
      <PageWrapper>
        <HeaderBox>
          <TabHeader title="Edit Order" />
          <Button
            type="primary"
            onClick={() => navigate(PATH_BILLING)}
            style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
          >
            Back to Billing
          </Button>
        </HeaderBox>
        <EmptyCard>
          <Empty description="No order selected. Please go to Billing and select an order to edit." />
        </EmptyCard>
      </PageWrapper>
    );
  }

  if (orderLoading && !initialized) {
    return (
      <PageWrapper>
        <HeaderBox>
          <TabHeader title="Loading Order..." />
        </HeaderBox>
        <LoadingWrapper>
          <Spin size="large" />
        </LoadingWrapper>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <HeaderBox>
        <TabHeader title={orderTitle} />
        <Button
          type="primary"
          onClick={() => navigate(PATH_BILLING, { state: { orderId } })}
          style={{ height: 32, fontWeight: 600, borderRadius: 8 }}
        >
          Back to Billing
        </Button>
      </HeaderBox>
      <CategorySelecter
        onChange={handleCategoryFilter}
        value={selectedCategory}
      />

      <ComposerCard>
        <PosContainer>
          {/* Left Column - Menu Grid */}
          <PosLeftPanel>
            <FilterRow>
              {order && (
                <OrderInfoBadge>
                  <EditOutlined /> Editing: {order.table_name || "Takeaway"} •
                  Order #{order.order_number}
                </OrderInfoBadge>
              )}

              <Input
                placeholder="Filter menu dishes..."
                prefix={<SearchOutlined />}
                value={posSearchText}
                onChange={(e) => setPosSearchText(e.target.value)}
                style={{ height: 38, borderRadius: 8, flex: 1 }}
                allowClear
              />
            </FilterRow>

              {catalogLoading ? (
                <p>Loading items catalog...</p>
              ) : menuFilteredCatalog?.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <Empty description="No menu items found" />
                </div>
              ) : (
                <MenuGrid>{
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
                ))}
                </MenuGrid>
              )}
          </PosLeftPanel>

          {/* Right Column - Edit Ticket */}
          <PosRightPanel>
            <HeaderBoxCustomerDetails>
              <ComposerTitle style={{ margin: 0 }}>Edit Order Ticket</ComposerTitle>
              <Space size="small" align="center">
                <span style={{ fontSize: 13, color: "var(--color-text-secondary)", fontWeight: 500 }}>
                  Customer Details
                </span>
                <Switch
                  checked={show_customer_details}
                  onChange={(checked) => dispatch(setShowCustomerDetails(checked))}
                  size="small"
                />
              </Space>
            </HeaderBoxCustomerDetails>

            {/* Customer Info (Address, Name & Phone - Toggled via Switch) */}
            {show_customer_details && (
              <>
                <div style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="Customer Address (Optional)"
                    prefix={<HomeOutlined />}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    style={{ height: 34, borderRadius: 8 }}
                    allowClear
                  />
                </div>

                <FilterRow style={{ marginBottom: 8 }}>
                  <Input
                    placeholder="Customer Name (Optional)"
                    prefix={<UserOutlined />}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ height: 34, borderRadius: 8 }}
                    allowClear
                  />
                  <Input
                    placeholder="Customer Phone (Optional)"
                    prefix={<PhoneOutlined />}
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ height: 34, borderRadius: 8 }}
                    allowClear
                  />
                </FilterRow>
              </>
            )}

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
                    No items in order.
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
                  disabled={selectedPosItems.length === 0 || saving || isKotLoading}
                  loading={saving && isPrintSubmitRef.current === false}
                  onClick={() => {
                    if (savingRef.current || isKotLoadingRef.current) return;
                    isPrintSubmitRef.current = false;
                    handleSaveOrder();
                  }}
                  icon={<SaveOutlined />}
                  style={{
                    flex: 1,
                    height: 42,
                    fontWeight: 700,
                    borderRadius: 10,
                    fontSize: 11,
                    padding: "0 2px",
                  }}
                >
                  Save Changes
                </Button>
                <Button
                  type="default"
                  block
                  disabled={selectedPosItems.length === 0 || saving || isKotLoading}
                  loading={saving && isPrintSubmitRef.current === "invoice"}
                  onClick={() => {
                    if (savingRef.current || isKotLoadingRef.current) return;
                    isPrintSubmitRef.current = "invoice";
                    handleSaveOrder();
                  }}
                  icon={<PrinterOutlined />}
                  style={{
                    flex: 1,
                    height: 42,
                    fontWeight: 700,
                    borderRadius: 10,
                    borderColor: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    fontSize: 11,
                    padding: "0 2px",
                  }}
                >
                  Save & Print
                </Button>
                <Button
                  type="default"
                  block
                  loading={isKotLoading}
                  disabled={selectedPosItems.length === 0 || saving || isKotLoading}
                  onClick={() => {
                    if (savingRef.current || isKotLoadingRef.current) return;
                    handleOpenKotModal();
                  }}
                  icon={<PrinterOutlined />}
                  style={{
                    flex: 1,
                    height: 42,
                    fontWeight: 700,
                    borderRadius: 10,
                    borderColor: "#ff9800",
                    color: "#d97706",
                    fontSize: 11,
                    padding: "0 2px",
                  }}
                >
                  KOT
                </Button>
                <Button
                  type="default"
                  block
                  disabled={selectedPosItems.length === 0 || saving || isKotLoading}
                  loading={saving && isPrintSubmitRef.current === "both"}
                  onClick={() => {
                    if (savingRef.current || isKotLoadingRef.current) return;
                    isPrintSubmitRef.current = "both";
                    handleSaveOrder();
                  }}
                  icon={<PrinterOutlined />}
                  style={{
                    flex: 1,
                    height: 42,
                    fontWeight: 700,
                    borderRadius: 10,
                    borderColor: "#7c3aed",
                    color: "#7c3aed",
                    fontSize: 11,
                    padding: "0 2px",
                  }}
                >
                  KOT & Order
                </Button>
              </div>
            </ComposerSummary>
          </PosRightPanel>
        </PosContainer>
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
        isCombined={isKotCombined}
      />
    </PageWrapper>
  );
};

export default OrderEditPage;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
`;

const EmptyCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const LoadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

const OrderInfoBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(var(--color-primary-rgb, 99, 102, 241), 0.08);
  border: 1px solid var(--color-primary-light);
  border-radius: 8px;
  padding: 0 12px;
  height: 38px;
  box-sizing: border-box;
  white-space: nowrap;
  flex-shrink: 0;
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
  align-items: center;

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
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  grid-auto-rows: max-content;
  align-content: start;
  gap: 8px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
`;

const MenuItemCard = styled.div`
  position: relative;
  height: 120px;
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
  height: 65px;
  object-fit: cover;
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
`;

const MenuAvatar = styled.div`
  width: 100%;
  height: 65px;
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
  white-space: normal;
  word-break: break-word;
  line-height: 1.2;
`;

const MenuMeta = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
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

const HeaderBoxCustomerDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 10px;
  margin-bottom: 10px;
`;

const ComposerTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
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
