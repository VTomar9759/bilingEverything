import React, { useMemo } from "react";
import styled from "styled-components";
import { Table } from "antd";
import { formatCurrency } from "../utils/reportUtils";

const StaffPerformance = ({ orders = [], admins = [], currency = "₹", permission = {}, user_role = "" }) => {
  const isAuthorized = user_role === "owner" || user_role === "super_admin" || permission.reports?.view !== false;

  const staffStats = useMemo(() => {
    const map = {};

    (admins || []).forEach((a) => {
      const name = a.name || a.email || "Admin";
      map[a.id || name] = {
        name,
        email: a.email || "",
        orders: 0,
        bills: 0,
        sales: 0,
        discounts: 0,
        cancelled: 0,
        refunds: 0,
      };
    });

    orders.forEach((o) => {
      const creatorId = o.created_by || o.user_id || o.biller_name || "Primary Admin";
      const creatorName = o.biller_name || o.created_by_name || creatorId;

      if (!map[creatorId] && !map[creatorName]) {
        map[creatorName] = {
          name: creatorName,
          email: "",
          orders: 0,
          bills: 0,
          sales: 0,
          discounts: 0,
          cancelled: 0,
          refunds: 0,
        };
      }

      const target = map[creatorId] || map[creatorName];

      const st = (o.status || "").toLowerCase();
      if (st === "cancelled") {
        target.cancelled++;
        return;
      }
      if (st === "refunded") {
        target.refunds += Number(o.total || 0);
        return;
      }

      target.orders++;
      target.bills++;
      target.sales += Number(o.total || 0);
      target.discounts += Number(o.discount || 0);
    });

    return Object.values(map).sort((a, b) => b.sales - a.sales);
  }, [orders, admins]);

  if (!isAuthorized) {
    return (
      <CardContainer>
        <LockNotice>
          🔒 You do not have permission to view staff performance metrics.
        </LockNotice>
      </CardContainer>
    );
  }

  const columns = [
    {
      title: "Staff Name / Biller",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <div>
          <StaffName>{name}</StaffName>
          {record.email && <StaffEmail>{record.email}</StaffEmail>}
        </div>
      ),
    },
    {
      title: "Orders Handled",
      dataIndex: "orders",
      key: "orders",
      align: "center",
    },
    {
      title: "Bills Generated",
      dataIndex: "bills",
      key: "bills",
      align: "center",
    },
    {
      title: "Total Sales",
      dataIndex: "sales",
      key: "sales",
      align: "right",
      render: (v) => <SalesVal>{formatCurrency(v, currency)}</SalesVal>,
    },
    {
      title: "Discounts Given",
      dataIndex: "discounts",
      key: "discounts",
      align: "right",
      render: (v) => formatCurrency(v, currency),
    },
    {
      title: "Cancelled Orders",
      dataIndex: "cancelled",
      key: "cancelled",
      align: "center",
      render: (v) => (
        <span style={{ color: v > 0 ? "#ef4444" : "#64748b" }}>{v}</span>
      ),
    },
    {
      title: "Refunds Issued",
      dataIndex: "refunds",
      key: "refunds",
      align: "right",
      render: (v) => formatCurrency(v, currency),
    },
  ];

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Staff Performance</Title>
          <SubTitle>Performance metrics on sales, bills generated, discounts, and order cancellations per staff member</SubTitle>
        </div>
      </CardHeader>

      <Table
        dataSource={staffStats}
        columns={columns}
        rowKey="name"
        pagination={{ pageSize: 8 }}
        size="small"
      />
    </CardContainer>
  );
};

export default StaffPerformance;

const CardContainer = styled.div`
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`;

const CardHeader = styled.div`
  margin-bottom: 16px;
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

const StaffName = styled.span`
  font-weight: 700;
  color: #0f172a;
  display: block;
`;

const StaffEmail = styled.span`
  font-size: 10.5px;
  color: #64748b;
`;

const SalesVal = styled.span`
  font-weight: 800;
  color: #01514b;
`;

const LockNotice = styled.div`
  padding: 20px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  font-weight: 600;
`;
