import React from "react";
import styled from "styled-components";
import { UserOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { TABLE_STATUS } from "../../../utils/constant";

const getStatusColor = (status) => {
  switch (status) {
    case TABLE_STATUS.available: return "#10b981"; // success
    case TABLE_STATUS.occupied: return "#3b82f6"; // primary/blue
    case TABLE_STATUS.reserved: return "#8b5cf6"; // purple
    case TABLE_STATUS.billed: return "#f59e0b"; // warning/orange
    case TABLE_STATUS.cleaning: return "#06b6d4"; // teal/cyan
    default: return "#9ca3af";
  }
};

const getColorFromCode = (code) => {
  if (!code) return null;
  const themes = {
    emerald: "#10b981",
    cobalt: "#3b82f6",
    amethyst: "#8b5cf6",
    amber: "#f59e0b",
    crimson: "#ef4444",
    teal: "#06b6d4",
  };
  return themes[code.toLowerCase()] || code;
};

const TableCardComponent = ({ table, onClick }) => {
  const customColor = getColorFromCode(table.color_code);
  const statusColor = getStatusColor(table.status);
  const activeColor = customColor || statusColor;

  return (
    <CardContainer $status={table.status} $activeColor={activeColor} onClick={onClick}>
      <CardHeader>
        <TableNum $activeColor={activeColor}>
          {table.table_number || table.name?.split(" ")?.[1] || table.name || "T?"}
        </TableNum>
        {table.section_name && (
          <SectionTag>
            <EnvironmentOutlined style={{ marginRight: 2 }} />
            {table.section_name}
          </SectionTag>
        )}
      </CardHeader>

      <ChairWrapper $shape={table.shape}>
        <TableShape 
          $status={table.status} 
          $shape={table.shape} 
          $activeColor={activeColor}
        >
          <TableSeats>
            <UserOutlined style={{ marginRight: 2 }} /> {table.capacity || table.seating_capacity}
          </TableSeats>
        </TableShape>
      </ChairWrapper>

      <CardFooter>
        <TableName>{table.table_name || table.name || "Dine-in Table"}</TableName>
        <StatusPill $color={statusColor}>{table.status}</StatusPill>
        
        {table.current_bill_amount > 0 && (
          <BillTag>
            Rs. {Number(table.current_bill_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </BillTag>
        )}
      </CardFooter>
    </CardContainer>
  );
};

export default TableCardComponent;

/* ─── Styled Components ─── */
const CardContainer = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  position: relative;
  min-height: 100px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: ${({ $activeColor }) => $activeColor};
  }
`;

const CardHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
`;

const TableNum = styled.span`
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 800;
  color: ${({ $activeColor }) => $activeColor};
`;

const SectionTag = styled.span`
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  padding: 1.5px 5px;
  border-radius: 6px;
  color: var(--color-text-secondary);
  font-weight: 600;
  max-width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChairWrapper = styled.div`
  position: relative;
  width: ${({ $shape }) => ($shape === "rectangle" ? "90px" : "60px")};
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
`;

const TableShape = styled.div`
  width: ${({ $shape }) => ($shape === "rectangle" ? "76px" : "46px")};
  height: 46px;
  border-radius: ${({ $shape }) => ($shape === "circle" ? "50%" : $shape === "square" ? "12px" : "14px")};
  background: ${({ $activeColor }) => `${$activeColor}14`};
  border: 2.5px solid ${({ $activeColor }) => $activeColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.03);
  transition: all var(--transition-base);
`;

const TableSeats = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: center;
  background: var(--color-surface);
  padding: 1.5px 5px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
`;

const CardFooter = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const TableName = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  width: 100%;
`;

const StatusPill = styled.span`
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: white;
  border: 1px solid ${({ $color }) => $color};
  color: ${({ $color }) => $color};
`;

const BillTag = styled.div`
  margin-top: 4px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #d97706;
  font-size: 9.5px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
`;
