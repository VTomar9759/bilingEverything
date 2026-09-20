import React, { useMemo } from "react";
import styled from "styled-components";
import { formatCurrency } from "../utils/reportUtils";

const ProfitLossStatement = ({ orders = [], expenses = [], itemsCatalog = [], currency = "₹" }) => {
  const pnlData = useMemo(() => {
    let grossSales = 0;
    let totalDiscount = 0;
    let totalRefunds = 0;

    let cogs = 0; // Cost of Goods Sold
    let hasCostData = false;

    // Create item cost lookup
    const itemCostMap = {};
    (itemsCatalog || []).forEach((item) => {
      const cost = Number(item.cost_price || item.cost || item.purchase_price || 0);
      if (cost > 0) {
        hasCostData = true;
        itemCostMap[item.id] = cost;
        if (item.name) itemCostMap[item.name.toLowerCase()] = cost;
      }
    });

    orders.forEach((o) => {
      if (o.status === "Cancelled") return;
      grossSales += Number(o.subtotal || o.total || 0);
      totalDiscount += Number(o.discount || 0);

      if (o.status === "Refunded") {
        totalRefunds += Number(o.total || 0);
      }

      // Calculate COGS
      (o.items || []).forEach((item) => {
        const qty = Number(item.quantity || item.qty || 1);
        const itemId = item.id || item.item_id;
        const itemName = (item.name || item.item_name || "").toLowerCase();
        const costPrice =
          Number(item.cost_price || item.cost) ||
          itemCostMap[itemId] ||
          itemCostMap[itemName] ||
          0;
        cogs += qty * costPrice;
      });
    });

    const netRevenue = Math.max(0, grossSales - totalDiscount - totalRefunds);

    // Group expenses
    let staffExpenses = 0;
    let rentExpenses = 0;
    let utilityExpenses = 0;
    let otherExpenses = 0;

    expenses.forEach((e) => {
      const amt = Number(e.amount || 0);
      const cat = String(e.category || "").toLowerCase();
      if (cat.includes("salary") || cat.includes("staff")) {
        staffExpenses += amt;
      } else if (cat.includes("rent")) {
        rentExpenses += amt;
      } else if (cat.includes("electricity") || cat.includes("gas") || cat.includes("utility")) {
        utilityExpenses += amt;
      } else {
        otherExpenses += amt;
      }
    });

    const totalOperatingExpenses = staffExpenses + rentExpenses + utilityExpenses + otherExpenses;
    const grossProfit = Math.max(0, netRevenue - cogs);
    const netProfit = netRevenue - cogs - totalOperatingExpenses;
    const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    return {
      grossSales,
      totalDiscount,
      totalRefunds,
      netRevenue,
      cogs,
      hasCostData,
      staffExpenses,
      rentExpenses,
      utilityExpenses,
      otherExpenses,
      totalOperatingExpenses,
      grossProfit,
      netProfit,
      profitMargin,
    };
  }, [orders, expenses, itemsCatalog]);

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <Title>Profit & Loss Statement</Title>
          <SubTitle>Financial statement summarizing net revenue, COGS, and operating expenses</SubTitle>
        </div>
      </CardHeader>

      {!pnlData.hasCostData && (
        <AlertBox>
          <AlertIcon>⚠️</AlertIcon>
          <AlertText>
            <strong>Profit data may be incomplete.</strong> Add cost/purchase prices to items in your catalog to calculate accurate Cost of Goods Sold (COGS) and profit.
          </AlertText>
        </AlertBox>
      )}

      <FinancialTable>
        <tbody>
          {/* Revenue section */}
          <SectionHeaderRow>
            <td colSpan="2">REVENUE & SALES</td>
          </SectionHeaderRow>
          <TableRow>
            <TableLabel>Gross Sales</TableLabel>
            <TableValue>{formatCurrency(pnlData.grossSales, currency)}</TableValue>
          </TableRow>
          <TableRow>
            <TableLabelSub>Less: Discounts</TableLabelSub>
            <TableValueSub>-{formatCurrency(pnlData.totalDiscount, currency)}</TableValueSub>
          </TableRow>
          <TableRow>
            <TableLabelSub>Less: Refunds</TableLabelSub>
            <TableValueSub>-{formatCurrency(pnlData.totalRefunds, currency)}</TableValueSub>
          </TableRow>
          <HighlightRow $color="#01514b">
            <TableLabelBold>Net Revenue</TableLabelBold>
            <TableValueBold>{formatCurrency(pnlData.netRevenue, currency)}</TableValueBold>
          </HighlightRow>

          {/* Cost of Goods Sold */}
          <SectionHeaderRow>
            <td colSpan="2">COST OF GOODS SOLD (COGS)</td>
          </SectionHeaderRow>
          <TableRow>
            <TableLabel>Food / Raw Item Cost</TableLabel>
            <TableValue>-{formatCurrency(pnlData.cogs, currency)}</TableValue>
          </TableRow>
          <HighlightRow $color="#10b981">
            <TableLabelBold>Gross Profit</TableLabelBold>
            <TableValueBold>{formatCurrency(pnlData.grossProfit, currency)}</TableValueBold>
          </HighlightRow>

          {/* Operating Expenses */}
          <SectionHeaderRow>
            <td colSpan="2">OPERATING EXPENSES</td>
          </SectionHeaderRow>
          <TableRow>
            <TableLabelSub>Staff Salary & Wages</TableLabelSub>
            <TableValue>-{formatCurrency(pnlData.staffExpenses, currency)}</TableValue>
          </TableRow>
          <TableRow>
            <TableLabelSub>Rent</TableLabelSub>
            <TableValue>-{formatCurrency(pnlData.rentExpenses, currency)}</TableValue>
          </TableRow>
          <TableRow>
            <TableLabelSub>Utilities (Electricity, Gas, Water)</TableLabelSub>
            <TableValue>-{formatCurrency(pnlData.utilityExpenses, currency)}</TableValue>
          </TableRow>
          <TableRow>
            <TableLabelSub>Other Operating Expenses</TableLabelSub>
            <TableValue>-{formatCurrency(pnlData.otherExpenses, currency)}</TableValue>
          </TableRow>
          <TableRow>
            <TableLabelBold>Total Operating Expenses</TableLabelBold>
            <TableValueBold>-{formatCurrency(pnlData.totalOperatingExpenses, currency)}</TableValueBold>
          </TableRow>

          {/* Net Profit Summary */}
          <SectionHeaderRow $isNetProfit>
            <td colSpan="2">NET FINANCIAL SUMMARY</td>
          </SectionHeaderRow>
          <FinalRow $isProfit={pnlData.netProfit >= 0}>
            <TableLabelFinal>Net Operating Profit</TableLabelFinal>
            <TableValueFinal>{formatCurrency(pnlData.netProfit, currency)}</TableValueFinal>
          </FinalRow>
          <TableRow>
            <TableLabelBold>Net Profit Margin %</TableLabelBold>
            <TableValueBold style={{ color: pnlData.profitMargin >= 0 ? "#10b981" : "#ef4444" }}>
              {pnlData.profitMargin.toFixed(1)}%
            </TableValueBold>
          </TableRow>
        </tbody>
      </FinancialTable>

      <PnlGrid>
        <MiniSummaryCard>
          <MiniLabel>Revenue</MiniLabel>
          <MiniVal $color="#01514b">{formatCurrency(pnlData.netRevenue, currency)}</MiniVal>
        </MiniSummaryCard>
        <MiniSummaryCard>
          <MiniLabel>Expenses</MiniLabel>
          <MiniVal $color="#ef4444">{formatCurrency(pnlData.cogs + pnlData.totalOperatingExpenses, currency)}</MiniVal>
        </MiniSummaryCard>
        <MiniSummaryCard>
          <MiniLabel>Profit</MiniLabel>
          <MiniVal $color="#10b981">{formatCurrency(pnlData.netProfit, currency)}</MiniVal>
        </MiniSummaryCard>
        <MiniSummaryCard>
          <MiniLabel>Profit Margin</MiniLabel>
          <MiniVal $color="#8b5cf6">{pnlData.profitMargin.toFixed(1)}%</MiniVal>
        </MiniSummaryCard>
      </PnlGrid>
    </CardContainer>
  );
};

export default ProfitLossStatement;

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
  margin: 3px 0 0 0;
`;

const AlertBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fffbebf5;
  border: 1px solid #fde68a;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const AlertIcon = styled.span`
  font-size: 16px;
`;

const AlertText = styled.span`
  font-size: 11.5px;
  color: #92400e;
  line-height: 1.4;
`;

const FinancialTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin-bottom: 20px;
`;

const SectionHeaderRow = styled.tr`
  td {
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
    font-size: 10.5px;
    letter-spacing: 0.5px;
    padding: 8px 10px;
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
  }
`;

const TableRow = styled.tr`
  td {
    padding: 7px 10px;
    border-bottom: 1px dashed #f1f5f9;
  }
`;

const HighlightRow = styled.tr`
  td {
    padding: 8px 10px;
    background: #f0fdf4;
    border-top: 1px solid #bbf7d0;
    border-bottom: 1px solid #bbf7d0;
  }
`;

const FinalRow = styled.tr`
  td {
    padding: 10px;
    background: ${({ $isProfit }) => ($isProfit ? "#ecfdf5" : "#fef2f2")};
    border-top: 2px solid ${({ $isProfit }) => ($isProfit ? "#10b981" : "#ef4444")};
    border-bottom: 2px solid ${({ $isProfit }) => ($isProfit ? "#10b981" : "#ef4444")};
  }
`;

const TableLabel = styled.td`
  color: #334155;
  font-weight: 500;
`;

const TableValue = styled.td`
  text-align: right;
  font-weight: 600;
  color: #0f172a;
`;

const TableLabelSub = styled.td`
  color: #64748b;
  padding-left: 20px !important;
`;

const TableValueSub = styled.td`
  text-align: right;
  color: #64748b;
`;

const TableLabelBold = styled.td`
  font-weight: 700;
  color: #0f172a;
`;

const TableValueBold = styled.td`
  text-align: right;
  font-weight: 700;
  color: #0f172a;
`;

const TableLabelFinal = styled.td`
  font-weight: 800;
  font-size: 13px;
  color: #0f172a;
`;

const TableValueFinal = styled.td`
  text-align: right;
  font-weight: 800;
  font-size: 14px;
  color: #0f172a;
`;

const PnlGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MiniSummaryCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
`;

const MiniLabel = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 2px;
`;

const MiniVal = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $color }) => $color};
`;
