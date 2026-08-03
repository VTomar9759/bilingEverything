import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useSelector } from "react-redux";
import { Button, Row, Col, Checkbox, message, Card, Empty, Badge as AntdBadge } from "antd";
import { FireOutlined, CheckCircleOutlined, ClockCircleOutlined, SmileOutlined } from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import * as service from "../../../services";

// Helper component to track and render elapsed time
const KOTTimer = ({ timestamp }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const difference = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
      setElapsed(difference);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [timestamp]);

  const isDelayed = elapsed >= 15;

  return (
    <TimerBadge $isDelayed={isDelayed}>
      <ClockCircleOutlined />
      <span>{elapsed} min elapsed</span>
    </TimerBadge>
  );
};

const KitchenOrders = () => {
  const { userId } = useSelector((state) => state.authSlice);

  const [loading, setLoading] = useState(true);
  const [kotOrders, setKotOrders] = useState([]);
  const [checkedDishes, setCheckedDishes] = useState({}); // orderId_dishIdx -> bool

  const fetchKitchenData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const ordersList = await service.getOrders(userId);
      // Kitchen KOT boards track Pending and Preparing orders
      const activeKots = ordersList.filter(o => o.status === "Pending" || o.status === "Preparing");
      setKotOrders(activeKots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();
    // Poll updates every 15s to keep cooking boards synced!
    const pollInterval = setInterval(fetchKitchenData, 15000);
    return () => clearInterval(pollInterval);
  }, [userId]);

  const handleStartCooking = async (orderId) => {
    try {
      const updated = await service.updateOrderStatus(userId, orderId, "Preparing");
      if (updated) {
        message.success("KOT marked as cooking in kitchen!");
        fetchKitchenData();
      }
    } catch (err) {
      message.error("Failed to start cooking");
    }
  };

  const handleMarkReady = async (orderId) => {
    try {
      const updated = await service.updateOrderStatus(userId, orderId, "Ready");
      if (updated) {
        message.success("KOT prepared! Notification sent to waiter staff.");
        fetchKitchenData();
      }
    } catch (err) {
      message.error("Failed to mark ready");
    }
  };

  const toggleDishCheck = (key) => {
    setCheckedDishes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <PageWrapper>
      {/* Page Header */}
      <TabHeader 
        breadcrumb={["Dashboard", "Kitchen"]}
        title="Kitchen Display System (KOT Monitor)"
        subtitle="Live cooking tickets, prep times trackers, and interactive cross-offs."
      />

      {loading && kotOrders.length === 0 ? (
        <p>Loading active kitchen logs...</p>
      ) : kotOrders.length === 0 ? (
        <EmptyCard>
          <SmileOutlined style={{ fontSize: 40, color: "var(--color-primary-light)", marginBottom: 12 }} />
          <h3>All Kitchen Orders Prepared!</h3>
          <p>Dine-in tables are fully served and content.</p>
        </EmptyCard>
      ) : (
        <KotsGrid gutter={[16, 16]}>
          {kotOrders.map((kot) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={kot.id}>
              <KotCard $isPreparing={kot.status === "Preparing"}>
                <KotCardHeader $isPreparing={kot.status === "Preparing"}>
                  <div>
                    <KotTableNum>{kot.table_name || "Takeaway"}</KotTableNum>
                    <KotId>KOT Ticket #{kot.id}</KotId>
                  </div>
                  <KOTTimer timestamp={kot.created_at} />
                </KotCardHeader>

                <KotItemsList>
                  {kot.items?.map((dish, idx) => {
                    const checkKey = `${kot.id}_${idx}`;
                    const isChecked = !!checkedDishes[checkKey];

                    return (
                      <KotDishRow key={idx} $isChecked={isChecked}>
                        <Checkbox 
                          checked={isChecked} 
                          onChange={() => toggleDishCheck(checkKey)}
                        >
                          <DishDetails>
                            <DishQty>x{dish.quantity}</DishQty>
                            <DishName>{dish.name}</DishName>
                          </DishDetails>
                        </Checkbox>
                        <DishCategory>{dish.category}</DishCategory>
                      </KotDishRow>
                    );
                  })}
                </KotItemsList>

                <KotFooter>
                  {kot.status === "Pending" ? (
                    <Button 
                      type="primary" 
                      block 
                      icon={<FireOutlined />}
                      onClick={() => handleStartCooking(kot.id)}
                      style={{ height: 32, fontWeight: 700, borderRadius: 8 }}
                    >
                      Start Cooking
                    </Button>
                  ) : (
                    <Button 
                      block 
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleMarkReady(kot.id)}
                      style={{ 
                        height: 32, 
                        fontWeight: 700, 
                        borderRadius: 8,
                        background: "#10b981", 
                        borderColor: "#10b981", 
                        color: "white" 
                      }}
                    >
                      KOT Prepared
                    </Button>
                  )}
                </KotFooter>
              </KotCard>
            </Col>
          ))}
        </KotsGrid>
      )}
    </PageWrapper>
  );
};

export default KitchenOrders;

const EmptyCard = styled(Card)`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: 60px 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);

  h3 { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 4px; }
  p { font-size: 11px; color: var(--color-text-secondary); margin: 0; }
`;

const KotsGrid = styled(Row)`
  width: 100%;
`;

const KotCard = styled.div`
  background: var(--color-surface);
  border: 2px solid ${({ $isPreparing }) => $isPreparing ? "var(--color-primary-light)" : "var(--color-border)"};
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 240px;
  transition: all var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const KotCardHeader = styled.div`
  background: ${({ $isPreparing }) => $isPreparing ? "rgba(1, 122, 113, 0.05)" : "var(--color-bg)"};
  padding: 10px 12px;
  border-bottom: 1.5px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 6px;
`;

const KotTableNum = styled.h4`
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
`;

const KotId = styled.div`
  font-size: 9px;
  color: var(--color-text-secondary);
  margin-top: 1px;
`;

const TimerBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  background: ${({ $isDelayed }) => $isDelayed ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)"};
  color: ${({ $isDelayed }) => $isDelayed ? "#ef4444" : "#10b981"};
`;

const KotItemsList = styled.div`
  padding: 11px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
  overflow-y: auto;
`;

const KotDishRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  border-bottom: 1px dashed var(--color-border-light);
  padding-bottom: 6px;

  .ant-checkbox-wrapper {
    span { 
      font-size: 11.5px;
      color: ${({ $isChecked }) => $isChecked ? "var(--color-text-muted)" : "var(--color-text-primary)"};
      text-decoration: ${({ $isChecked }) => $isChecked ? "line-through" : "none"};
      transition: all 0.2s ease;
    }
  }
`;

const DishDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DishQty = styled.strong`
  font-size: 12px;
  color: var(--color-primary);
`;

const DishName = styled.span`
  font-weight: 700;
`;

const DishCategory = styled.span`
  font-size: 8.5px;
  font-weight: 600;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  padding: 1px 5px;
  border-radius: 4px;
  text-transform: uppercase;
`;

const KotFooter = styled.div`
  padding: 8px 12px 12px;
  border-top: 1px dashed var(--color-border-light);
`;
