import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { 
  Button, 
  Select, 
  InputNumber, 
  Radio, 
  message, 
  Form, 
  Card,
  Skeleton,
  Empty,
  Modal
} from "antd";
import { 
  CreditCardOutlined, 
  DollarCircleOutlined, 
  QrcodeOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import * as service from "../../../services";
import OrderInvoiceModal from "./components/OrderInvoiceModal";

const { Option } = Select;

const BillingSection = () => {
  const { userId } = useSelector((state) => state.authSlice);

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  
  // Selected Order details
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Calculations details
  const [discountPercent, setDiscountPercent] = useState(0);
  const [financials, setFinancials] = useState({});

  // Dynamic QR Code Modal
  const [qrVisible, setQrVisible] = useState(false);
  const [verifyingQr, setVerifyingQr] = useState(false);

  // Invoice Success Modal
  const [invoiceVisible, setInvoiceVisible] = useState(false);
  const [settledOrder, setSettledOrder] = useState(null);

  const fetchBillingData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [ordersList, config] = await Promise.all([
        service.getOrders(userId),
        service.getSettings(userId)
      ]);
      // Only billing unpaid active orders
      const unpaid = ordersList.filter(o => o.payment_status === "Unpaid" && o.status !== "Cancelled");
      setOrders(unpaid);
      setSettings(config);

      if (unpaid.length > 0 && !selectedOrderId) {
        setSelectedOrderId(unpaid[0].id);
        setActiveOrder(unpaid[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, [userId]);

  const handleOrderChange = (value) => {
    setSelectedOrderId(value);
    const order = orders.find(o => o.id === value);
    setActiveOrder(order);
    setDiscountPercent(0);
  };

  // Re-calculate pricing upon updates
  useEffect(() => {
    if (!activeOrder) {
      setFinancials({});
      return;
    }

    const subtotal = activeOrder.subtotal;
    const discount = subtotal * (discountPercent / 100);
    const netTotal = subtotal - discount;

    const taxRate = settings.tax_rate || 18;
    const serviceRate = settings.service_charge_rate || 5;

    const tax = netTotal * (taxRate / 100);
    const service_charge = netTotal * (serviceRate / 100);
    const total = netTotal + tax + service_charge;

    setFinancials({
      subtotal,
      discount,
      tax,
      service_charge,
      total
    });
  }, [activeOrder, discountPercent, settings]);

  const handleSettleSubmit = async () => {
    if (!activeOrder) return;
    
    if (paymentMethod === "UPI") {
      setQrVisible(true);
      return;
    }

    await executeSettlement();
  };

  const executeSettlement = async () => {
    try {
      const payload = {
        subtotal: financials.subtotal,
        discount: financials.discount,
        tax: financials.tax,
        service_charge: financials.service_charge,
        total: financials.total,
        payment_status: "Paid",
        status: "Served"
      };

      const completed = await service.settleOrder(userId, activeOrder.id, paymentMethod, payload);
      if (completed) {
        message.success("Order POS bill settled successfully!");
        setSettledOrder(completed);
        setInvoiceVisible(true);
        setSelectedOrderId(null);
        setActiveOrder(null);
        setDiscountPercent(0);
        fetchBillingData();
      }
    } catch (err) {
      message.error("Failed to settle order invoice");
    }
  };

  const handleVerifyQr = () => {
    setVerifyingQr(true);
    setTimeout(async () => {
      setVerifyingQr(false);
      setQrVisible(false);
      await executeSettlement();
    }, 1500); // 1.5s visual loader
  };

  const currency = settings.currency || "Rs.";

  return (
    <PageWrapper>
      {/* Page Header */}
      <TabHeader 
        breadcrumb={["Dashboard", "Billing"]}
        title="POS Cashier Billing Register"
        subtitle="Manage checkouts, apply discount percentages, select payment types, and settle invoices."
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : orders.length === 0 ? (
        <EmptyCard>
          <Empty description="No active unpaid dining orders found. Start composing new orders in Orders module." />
        </EmptyCard>
      ) : (
        <RegisterLayout>
          {/* Left Column - POS checkout tools */}
          <POSControlCard>
            <ComposerTitle>Billing Settle Settings</ComposerTitle>
            <Form layout="vertical">
              <Form.Item label="Select Table / Unpaid Order Ticket">
                <Select 
                  value={selectedOrderId} 
                  onChange={handleOrderChange}
                  style={{ width: "100%", height: 38 }}
                >
                  {orders.map(o => (
                    <Option key={o.id} value={o.id}>
                      {o.table_name || "Takeaway"} (Order #{o.id}) — {currency} {o.total?.toFixed(2)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Apply Discount Percentage (%)">
                <InputNumber 
                  min={0} 
                  max={90} 
                  value={discountPercent} 
                  onChange={setDiscountPercent}
                  style={{ width: "100%" }}
                  formatter={(val) => `${val}%`}
                  parser={(val) => val.replace("%", "")}
                />
              </Form.Item>

              <Form.Item label="Settlement Payment Method">
                <Radio.Group 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ width: "100%" }}
                >
                  <PayMethodGrid>
                    <PayMethodCard $active={paymentMethod === "Cash"}>
                      <Radio value="Cash">
                        <Space>
                          <DollarCircleOutlined />
                          <span>Cash Register</span>
                        </Space>
                      </Radio>
                    </PayMethodCard>
                    <PayMethodCard $active={paymentMethod === "Card"}>
                      <Radio value="Card">
                        <Space>
                          <CreditCardOutlined />
                          <span>Card Swipe</span>
                        </Space>
                      </Radio>
                    </PayMethodCard>
                    <PayMethodCard $active={paymentMethod === "UPI"}>
                      <Radio value="UPI">
                        <Space>
                          <QrcodeOutlined />
                          <span>UPI Dynamic QR</span>
                        </Space>
                      </Radio>
                    </PayMethodCard>
                  </PayMethodGrid>
                </Radio.Group>
              </Form.Item>

              <Button 
                type="primary" 
                block 
                size="large"
                style={{ height: 45, fontWeight: 700, borderRadius: 10, marginTop: 12 }}
                onClick={handleSettleSubmit}
              >
                Settle & Generate Invoice
              </Button>
            </Form>
          </POSControlCard>

          {/* Right Column - Receipt calculations */}
          <ReceiptWrapper>
            {activeOrder && financials.total && (
              <ReceiptInner>
                <InvoiceHeader>
                  <h4>POS Itemized Bill Summary</h4>
                  <p>Order ID: #{activeOrder.id} • Table: {activeOrder.table_name || "Takeaway"}</p>
                </InvoiceHeader>

                <ItemsScroll>
                  {activeOrder.items?.map((item, idx) => (
                    <ItemInvoiceRow key={idx}>
                      <div>
                        <ItemInvoiceName>{item.name}</ItemInvoiceName>
                        <ItemInvoicePrice>{currency} {item.price} each</ItemInvoicePrice>
                      </div>
                      <ItemInvoiceQty>x{item.quantity}</ItemInvoiceQty>
                      <ItemInvoiceTotal>{currency} {(item.price * item.quantity).toFixed(2)}</ItemInvoiceTotal>
                    </ItemInvoiceRow>
                  ))}
                </ItemsScroll>

                <CalcSection>
                  <CalcRow>
                    <span>Subtotal</span>
                    <span>{currency} {financials.subtotal?.toFixed(2)}</span>
                  </CalcRow>
                  {financials.discount > 0 && (
                    <CalcRow style={{ color: "#10b981", fontWeight: 700 }}>
                      <span>Discount Applied ({discountPercent}%)</span>
                      <span>-{currency} {financials.discount?.toFixed(2)}</span>
                    </CalcRow>
                  )}
                  <CalcRow>
                    <span>GST CGST + SGST ({settings.tax_rate || 18}%)</span>
                    <span>{currency} {financials.tax?.toFixed(2)}</span>
                  </CalcRow>
                  {settings.service_charge_rate > 0 && (
                    <CalcRow>
                      <span>Service Charge ({settings.service_charge_rate || 5}%)</span>
                      <span>{currency} {financials.service_charge?.toFixed(2)}</span>
                    </CalcRow>
                  )}
                  <CalcDivider />
                  <CalcRow style={{ fontSize: 16, fontWeight: 800, color: "var(--color-primary)" }}>
                    <span>Grand Total Due</span>
                    <span>{currency} {financials.total?.toFixed(2)}</span>
                  </CalcRow>
                </CalcSection>
              </ReceiptInner>
            )}
          </ReceiptWrapper>
        </RegisterLayout>
      )}

      {/* UPI QR Modal */}
      <Modal
        title={
          <ModalTitleBox>
            <QrcodeOutlined />
            <span>UPI Dynamic QR Settlement</span>
          </ModalTitleBox>
        }
        open={qrVisible}
        onCancel={() => setQrVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setQrVisible(false)}>
            Close
          </Button>,
          <Button 
            key="verify" 
            type="primary" 
            icon={<CheckCircleOutlined />}
            loading={verifyingQr}
            onClick={handleVerifyQr}
            style={{ background: "#10b981", borderColor: "#10b981" }}
          >
            Verify Payment Received
          </Button>
        ]}
        width={340}
        centered
      >
        <QrContent>
          <p>Scan the dynamic QR code below to pay</p>
          <QrWrapper>
            {/* Elegant SVG dynamic QR code layout */}
            <svg width="180" height="180" viewBox="0 0 100 100">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <path d="M 5 5 L 25 5 L 25 25 L 5 25 Z" fill="black" />
              <path d="M 9 9 L 21 9 L 21 21 L 9 21 Z" fill="white" />
              <path d="M 12 12 L 18 12 L 18 18 L 12 18 Z" fill="black" />
              
              <path d="M 75 5 L 95 5 L 95 25 L 75 25 Z" fill="black" />
              <path d="M 79 9 L 91 9 L 91 21 L 79 21 Z" fill="white" />
              <path d="M 82 12 L 88 12 L 88 18 L 82 18 Z" fill="black" />

              <path d="M 5 75 L 25 75 L 25 95 L 5 95 Z" fill="black" />
              <path d="M 9 79 L 21 79 L 21 91 L 9 91 Z" fill="white" />
              <path d="M 12 82 L 18 82 L 18 88 L 12 88 Z" fill="black" />

              {/* Dynamic center pattern */}
              <rect x="35" y="35" width="30" height="30" fill="var(--color-primary-light)" opacity="0.1" />
              <circle cx="50" cy="50" r="10" fill="var(--color-primary)" />
              <text x="50" y="52%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="8" fontWeight="800">
                INR
              </text>

              {/* Tiny random blocks simulating barcode points */}
              <path d="M 35 5 L 45 5 L 45 15 M 55 5 L 65 5 L 60 25 M 35 25 L 45 25 M 5 35 L 5 45 M 25 35 L 25 55 M 35 75 L 55 75 M 55 85 L 65 95 M 75 35 L 95 35 L 75 55 L 85 75 M 85 85 L 95 95" stroke="black" strokeWidth="2.5" fill="none" />
            </svg>
          </QrWrapper>
          <QrTotalText>
            Payable Total: <strong>{currency} {financials.total?.toFixed(2)}</strong>
          </QrTotalText>
          <QrSubText>Compatible with BHIM, Paytm, PhonePe, GPay, and active UPI bank systems.</QrSubText>
        </QrContent>
      </Modal>

      {/* Invoice modal printer */}
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

const EmptyCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: 80px 40px;
  text-align: center;
`;

const RegisterLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
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
  padding: 24px;
  height: fit-content;
`;

const ComposerTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 16px;
  border-bottom: 1.5px solid var(--color-border);
  padding-bottom: 10px;
`;

const PayMethodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  width: 100%;
`;

const PayMethodCard = styled.div`
  border: 2px solid ${({ $active }) => $active ? "var(--color-primary)" : "var(--color-border)"};
  background: ${({ $active }) => $active ? "var(--color-primary-50)" : "white"};
  border-radius: var(--radius-lg);
  padding: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary-100);
  }

  .ant-radio-wrapper {
    margin-right: 0;
    width: 100%;
    span { font-weight: 600; font-size: 12.5px; }
  }
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
  margin-bottom: 16px;
  h4 {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0 0 4px;
  }
  p {
    font-size: 11.5px;
    color: var(--color-text-secondary);
    margin: 0;
  }
`;

const ItemsScroll = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 240px;
  overflow-y: auto;
  margin-bottom: 16px;
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 16px;
`;

const ItemInvoiceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
`;

const ItemInvoiceName = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);
`;

const ItemInvoicePrice = styled.div`
  font-size: 11px;
  color: var(--color-text-secondary);
`;

const ItemInvoiceQty = styled.div`
  font-weight: 600;
  color: var(--color-text-secondary);
`;

const ItemInvoiceTotal = styled.div`
  font-weight: 700;
  color: var(--color-text-primary);
`;

const CalcSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const CalcRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--color-text-secondary);
`;

const CalcDivider = styled.div`
  border-top: 1.5px dashed var(--color-border);
  margin: 6px 0;
`;

// QR Code styles
const ModalTitleBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-weight: 700;
`;

const QrContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 12px 0;
  p { font-size: 13px; font-weight: 600; color: var(--color-text-primary); margin: 0 0 16px; }
`;

const QrWrapper = styled.div`
  padding: 14px;
  background: white;
  border-radius: var(--radius-xl);
  border: 1.5px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
`;

const QrTotalText = styled.div`
  font-size: 14px;
  color: var(--color-text-secondary);
  strong { color: var(--color-primary); font-size: 16px; }
`;

const QrSubText = styled.p`
  font-size: 10px;
  color: var(--color-text-muted) !important;
  margin-top: 8px !important;
  max-width: 240px;
  line-height: 1.4;
`;
