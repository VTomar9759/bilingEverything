import { useMemo } from "react";
import styled from "styled-components";
import { Button, Space } from "antd";
import { ReloadOutlined, DesktopOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PageSpinner, EmptyPlaceholder } from "../../../loader/PageSpinner";

import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import useQueue from "../../hooks/useQueue";
import QueueCard from "./components/QueueCard";
import { PATH_ONLY_QUEUE, PATH_ORDER_QUEUE } from "../../routes/pathname";

const Queue = ({ hideCustomerNav = false, showExitNav = false }) => {
  const navigate = useNavigate();
  const [queueListing, loading, refetch] = useQueue();

  // Sort: "Ready" orders first, then by date/time (oldest first)
  const sortedQueue = useMemo(() => {
    return [...queueListing].sort((a, b) => {
      const aReady = a.status?.toLowerCase() === "ready" ? 0 : 1;
      const bReady = b.status?.toLowerCase() === "ready" ? 0 : 1;
      if (aReady !== bReady) return aReady - bReady;
      // Within the same status group, oldest first
      return new Date(a.created_at) - new Date(b.created_at);
    });
  }, [queueListing]);


  const isInitialLoading = loading && queueListing.length === 0;

  return (
    <PageWrapper>
      {/* Page Header */}
      <HeaderBox>
        <TabHeader title="Order Queue" />
        <Space>
          {showExitNav && (
            <Button
              danger
              icon={<LogoutOutlined />}
              onClick={() => navigate(PATH_ORDER_QUEUE)}
              style={{ height: 32, borderRadius: 8 }}
            >
              Exit
            </Button>
          )}
          {!hideCustomerNav && (
            <Button
              type="primary"
              icon={<DesktopOutlined />}
              onClick={() => navigate(PATH_ONLY_QUEUE)}
              style={{ height: 32, borderRadius: 8 }}
            >
              Customer Queue Layout
            </Button>
          )}
          <Button
            icon={<ReloadOutlined spin={loading} />}
            loading={loading}
            onClick={refetch}
            style={{ height: 32, width: 32, borderRadius: 8 }}
          />
        </Space>
      </HeaderBox>

      {/* Queue Grid */}
      {isInitialLoading ? (
        <PageSpinner minHeight="300px" />
      ) : sortedQueue.length === 0 ? (
        <EmptyPlaceholder
          icon="📎"
          title="No orders in queue"
          desc="The order queue is currently empty. New orders will appear here automatically."
        />
      ) : (
        <QueueGrid>
          {sortedQueue.map((order) => (
            <QueueCard key={order.id} order={order} />
          ))}
        </QueueGrid>
      )}
    </PageWrapper>
  );
};

export default Queue;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
`;

const CardSkeletonContainer = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-primary);
  border-radius: var(--radius-xl);
  padding: 16px;
`;

const QueueGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
  width: 100%;
  margin-top: 12px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  @media (min-width: 1000px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }

  @media (min-width: 1400px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
  }

  @media (min-width: 1800px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 20px;
  }
`;

const LoadingBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 240px;
  width: 100%;
`;



