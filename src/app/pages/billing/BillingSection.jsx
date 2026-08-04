import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Select, InputNumber, Form, Skeleton, Empty } from "antd";
import dayjs from "dayjs";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import * as service from "../../../services";
import OrderInvoiceModal from "../../print/OrderInvoiceModal";
import { PATH_ORDERS } from "../../routes/pathname";
import { ShoppingCartOutlined } from "@ant-design/icons";
import useSettings from "../../hooks/useSettings";

const { Option } = Select;

const BillingSection = () => {
  const { userId } = useSelector((state) => state.authSlice);
  const location = useLocation();
  console.log(location, "sss");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const { settings = {} } = useSettings();
  const isClearedRef = useRef(false);

  // Selected order
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);

  // Discount / calculations
  const [discountPercent, setDiscountPercent] = useState(0);
  const [financials, setFinancials] = useState({});

  // Invoice modal
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [settledOrder, setSettledOrder] = useState(null);

  /**
   * Fetch billing data
   */
  const fetchBillingData = async (shouldAutoSelect = true) => {
    if (!userId) return;

    setLoading(true);

    try {
      const todayStr = dayjs().format("YYYY-MM-DD");
      const yesterdayStr = dayjs().subtract(1, "day").format("YYYY-MM-DD");

      const targetOrderId =
        location.state?.orderId ||
        new URLSearchParams(location.search).get("orderId");

      let ordersList = [];
      if (targetOrderId) {
        ordersList = await service.getOrders({
          userId,
          orderId: targetOrderId,
        });
      } else {
        ordersList = await service.getOrders({
          userId,
          startDate: yesterdayStr,
          endDate: todayStr,
        });
      }

      // Only show orders that are not served/cancelled
      const activePending = ordersList.filter(
        (order) => order.status !== "Served" && order.status !== "Cancelled",
      );

      setOrders(activePending);

      const autoSelect = isClearedRef.current ? false : shouldAutoSelect;
      isClearedRef.current = false;

      if (autoSelect) {
        if (targetOrderId) {
          const targetOrder = activePending.find(
            (order) => order.id === targetOrderId,
          );

          if (targetOrder) {
            setSelectedOrderId(targetOrder.id);
            setActiveOrder(targetOrder);
            return;
          }
        }

        /**
         * Automatically select first order
         */
        if (activePending.length > 0) {
          setSelectedOrderId((currentId) => {
            const currentOrderExists = activePending.some(
              (order) => order.id === currentId,
            );

            if (currentOrderExists) {
              return currentId;
            }

            return activePending[0].id;
          });

          setActiveOrder((currentOrder) => {
            const currentOrderExists = activePending.some(
              (order) => order.id === currentOrder?.id,
            );

            if (currentOrderExists) {
              return currentOrder;
            }

            return activePending[0];
          });
        } else {
          setSelectedOrderId(null);
          setActiveOrder(null);
        }
      } else {
        setSelectedOrderId(null);
        setActiveOrder(null);
      }
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [userId, location.state, location.search]);

  /**
   * Select order
   */
  const handleOrderChange = (value) => {
    if (value === undefined || value === null) {
      setSelectedOrderId(null);
      setActiveOrder(null);
      setDiscountPercent(0);
      isClearedRef.current = true;
      navigate(location.pathname, { replace: true, state: {} });
      return;
    }

    setSelectedOrderId(value);

    const order = orders.find((item) => item.id === value);

    setActiveOrder(order || null);
    setDiscountPercent(0);
  };

  /**
   * Calculate billing
   */
  useEffect(() => {
    if (!activeOrder) {
      setFinancials({});
      return;
    }

    const subtotal = Number(activeOrder.subtotal || 0);

    const discount = subtotal * (Number(discountPercent || 0) / 100);

    const netTotal = subtotal - discount;

    const taxRate = Number(settings.tax_rate ?? 18);
    const serviceRate = Number(settings.service_charge_rate ?? 5);

    const tax = netTotal * (taxRate / 100);
    const service_charge = netTotal * (serviceRate / 100);

    const total = netTotal + tax + service_charge;

    setFinancials({
      subtotal,
      discount,
      tax,
      service_charge,
      total,
    });
  }, [activeOrder, discountPercent, settings]);

  /**
   * Generate invoice
   */
  const handleSettleSubmit = () => {
    if (!activeOrder) return;

    const finalizedOrder = {
      ...activeOrder,
      subtotal: financials.subtotal,
      discount: financials.discount,
      tax: financials.tax,
      service_charge: financials.service_charge,
      total: financials.total,
      status: "Served",
    };

    setSettledOrder(finalizedOrder);
    setInvoiceVisible(true);
  };

  /**
   * Currency
   */
  const currency = settings.currency || "Rs.";

  return (
    <PageWrapper>
      {/* Header */}
      <HeaderBox>
        <TabHeader
          breadcrumb={["Orders", "Billing"]}
          title="POS Billing & Invoicing Register"
          subtitle="Manage billing, apply discount percentages, and generate invoices."
        />

        <Button
          type="primary"
          onClick={() => navigate(PATH_ORDERS)}
          style={{
            height: 32,
            fontWeight: 600,
            borderRadius: 8,
          }}
        >
          Orders Listing
        </Button>
      </HeaderBox>

      {/* Loading */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : orders.length === 0 ? (
        /* Empty */
        <EmptyCard>
          <Empty description="No active dining orders found. Start composing new orders in Orders module." />
        </EmptyCard>
      ) : (
        <RegisterLayout>
          {/* LEFT SIDE */}
          <POSControlCard>
            <ComposerTitle>Billing Invoice Settings</ComposerTitle>

            <Form layout="vertical">
              {/* SEARCHABLE ORDER SELECT */}
              <Form.Item label="Search & Select Order">
                <Select
                  showSearch
                  value={selectedOrderId}
                  onChange={handleOrderChange}
                  placeholder="Search Order ID or Table..."
                  style={{
                    width: "100%",
                  }}
                  size="large"
                  allowClear
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  notFoundContent="No matching orders found"
                >
                  {orders.map((order) => {
                    const tableName = order.table_name || "Takeaway";

                    const orderNumber = order.order_number || order.id;

                    const searchLabel =
                      `${orderNumber} ${tableName}`.toLowerCase();

                    return (
                      <Option
                        key={order.id}
                        value={order.id}
                        label={searchLabel}
                      >
                        <OrderOption>
                          <OrderOptionInfo>
                            <OrderTable>{tableName}</OrderTable>

                            <OrderNumber>Order #{orderNumber}</OrderNumber>
                          </OrderOptionInfo>

                          <OrderAmount>
                            {currency} {Number(order.total || 0).toFixed(2)}
                          </OrderAmount>
                        </OrderOption>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>

              {/* DISCOUNT */}
              <Form.Item label="Apply Discount Percentage (%)">
                <InputNumber
                  min={0}
                  max={90}
                  value={discountPercent}
                  onChange={(value) => setDiscountPercent(Number(value || 0))}
                  style={{
                    width: "100%",
                  }}
                  size="large"
                  formatter={(value) => `${value}%`}
                  parser={(value) => value?.replace("%", "") || ""}
                />
              </Form.Item>

              {/* GENERATE INVOICE */}
              <Button
                type="primary"
                block
                size="large"
                disabled={!activeOrder}
                onClick={handleSettleSubmit}
                style={{
                  height: 45,
                  fontWeight: 700,
                  borderRadius: 10,
                  marginTop: 12,
                }}
              >
                Generate Invoice
              </Button>
            </Form>
          </POSControlCard>

          {/* RIGHT SIDE - RECEIPT */}
          <ReceiptWrapper>
            {activeOrder ? (
              <ReceiptInner>
                {/* Invoice Header */}
                <InvoiceHeader>
                  <h4>POS Itemized Bill Summary</h4>

                  <p>
                    Order No: #{activeOrder.order_number} • Table:{" "}
                    {activeOrder.table_name || "Takeaway"}
                  </p>
                </InvoiceHeader>

                {/* ITEMS */}
                <ItemsScroll>
                  {activeOrder.items?.map((item, index) => (
                    <ItemInvoiceRow key={index}>
                      <ItemInvoiceDetails>
                        <ItemInvoiceName>{item.name}</ItemInvoiceName>

                        <ItemInvoicePrice>
                          {currency} {item.price} each
                        </ItemInvoicePrice>
                      </ItemInvoiceDetails>

                      <ItemInvoiceQty>x{item.quantity}</ItemInvoiceQty>

                      <ItemInvoiceTotal>
                        {currency}{" "}
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toFixed(2)}
                      </ItemInvoiceTotal>
                    </ItemInvoiceRow>
                  ))}
                </ItemsScroll>

                {/* CALCULATIONS */}
                <CalcSection>
                  {/* SUBTOTAL */}
                  <CalcRow>
                    <span>Subtotal</span>

                    <span>
                      {currency}{" "}
                      {Number(
                        financials.subtotal ?? activeOrder.subtotal ?? 0,
                      ).toFixed(2)}
                    </span>
                  </CalcRow>

                  {/* DISCOUNT */}
                  {financials.discount > 0 && (
                    <CalcRow
                      style={{
                        color: "#10b981",
                        fontWeight: 700,
                      }}
                    >
                      <span>Discount Applied ({discountPercent}%)</span>

                      <span>
                        -{currency}{" "}
                        {Number(financials.discount || 0).toFixed(2)}
                      </span>
                    </CalcRow>
                  )}

                  {/* TAX */}
                  <CalcRow>
                    <span>GST CGST + SGST ({settings.tax_rate ?? 18}%)</span>

                    <span>
                      {currency}{" "}
                      {Number(financials.tax ?? activeOrder.tax ?? 0).toFixed(
                        2,
                      )}
                    </span>
                  </CalcRow>

                  {/* SERVICE CHARGE */}
                  {Number(settings.service_charge_rate ?? 0) > 0 && (
                    <CalcRow>
                      <span>
                        Service Charge ({settings.service_charge_rate ?? 5}%)
                      </span>

                      <span>
                        {currency}{" "}
                        {Number(
                          financials.service_charge ??
                          activeOrder.service_charge ??
                          0,
                        ).toFixed(2)}
                      </span>
                    </CalcRow>
                  )}

                  <CalcDivider />

                  {/* GRAND TOTAL */}
                  <CalcRow
                    style={{
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: "var(--color-primary)",
                    }}
                  >
                    <span>Grand Total Due</span>

                    <span>
                      {currency}{" "}
                      {Number(
                        financials.total ?? activeOrder.total ?? 0,
                      ).toFixed(2)}
                    </span>
                  </CalcRow>
                </CalcSection>
              </ReceiptInner>
            ) : (
              <EmptyCard>
                <Empty
                  description="No active order selected"
                  image={<ShoppingCartOutlined style={{ fontSize: 48 }} />}
                />
              </EmptyCard>
            )}
          </ReceiptWrapper>
        </RegisterLayout>
      )}

      {/* INVOICE MODAL */}
      <OrderInvoiceModal
        visible={invoiceVisible}
        onClose={() => setInvoiceVisible(false)}
        order={settledOrder}
        settings={settings}
      />
    </PageWrapper>
  );
};

export default BillingSection;

/* =========================================================
   STYLES
========================================================= */

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
  border: 1px solid var(--color-border);
  padding: 32px 20px;
  height: 100%;
  text-align: center;
`;

const RegisterLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  width: 100%;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

const POSControlCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  padding: 12px 14px;
  height: fit-content;
`;

const ComposerTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;

  border-bottom: 1.5px solid var(--color-border);
  padding-bottom: 6px;
`;

const OrderOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`;

const OrderOptionInfo = styled.div`
  display: flex;
  gap: 16px;
  justify-content: start;
  align-items: center;
`;

const OrderTable = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const OrderNumber = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const OrderAmount = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary);
  white-space: nowrap;
`;

const ReceiptWrapper = styled(POSControlCard)`
  background: #fbfcfd;
`;

const ReceiptInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const InvoiceHeader = styled.div`
  margin-bottom: 12px;

  h4 {
    font-family: var(--font-display);
    font-size: 12.5px;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 4px;
  }

  p {
    font-size: 10px;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const ItemsScroll = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 12px;
`;

const ItemInvoiceRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;

  font-size: 11.5px;
`;

const ItemInvoiceDetails = styled.div`
  min-width: 0;
`;

const ItemInvoiceName = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemInvoicePrice = styled.div`
  font-size: 10px;
  color: var(--color-text-secondary);
`;

const ItemInvoiceQty = styled.div`
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
`;

const ItemInvoiceTotal = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
`;

const CalcSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const CalcRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 20px;

  font-size: 11px;
  color: var(--color-text-secondary);

  span:last-child {
    white-space: nowrap;
  }
`;

const CalcDivider = styled.div`
  border-top: 1.5px dashed var(--color-border);
  margin: 5px 0;
`;
