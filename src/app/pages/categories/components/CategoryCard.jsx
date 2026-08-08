import React from "react";
import styled from "styled-components";
import { EditOutlined, DeleteOutlined, FolderOpenOutlined } from "@ant-design/icons";
import { Popconfirm, Tooltip } from "antd";

const CategoryCard = ({ category, onEdit, onDelete, canUpdate = true, canDelete = true }) => {
  const hasActions = canUpdate || canDelete;

  return (
    <CardContainer>
      <CardContent>
        <IconWrapper>
          <FolderOpenOutlined />
        </IconWrapper>
        <CategoryDetails>
          <CategoryName title={category.name}>{category.name}</CategoryName>
        </CategoryDetails>
      </CardContent>

      {hasActions && (
        <ActionsOverlay>
          {canUpdate && (
            <Tooltip title="Edit Category">
              <ActionButton onClick={() => onEdit(category)}>
                <EditOutlined />
              </ActionButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete Category">
              <Popconfirm
                title="Are you sure you want to delete this category?"
                description="This action cannot be undone."
                onConfirm={() => onDelete(category.id)}
                okText="Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <ActionButton $danger>
                  <DeleteOutlined />
                </ActionButton>
              </Popconfirm>
            </Tooltip>
          )}
        </ActionsOverlay>
      )}
    </CardContainer>
  );
};

export default CategoryCard;

/* ─── Styled Components ─── */
const CardContainer = styled.div`
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-shadow: var(--shadow-xs);
  transition: all var(--transition-base);
  height: 64px;
  min-width: 160px;
  width: max-content;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    border-color: var(--color-primary-200);
    background: var(--color-primary-50);
  }

  @media (max-width: 480px) {
    min-width: 130px;
  }
`;

const CardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
`;

const IconWrapper = styled.div`
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-50);
  color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  transition: all var(--transition-base);

  ${CardContainer}:hover & {
    background: var(--color-primary);
    color: white;
  }
`;

const CategoryDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const CategoryName = styled.div`
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  padding-right: 12px;
  line-height: 1.3;
`;

const ActionsOverlay = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%) translateX(10px);
  display: flex;
  gap: 6px;
  background: linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--color-surface) 30%, var(--color-surface) 100%);
  padding-left: 24px;
  padding-right: 4px;
  opacity: 0;
  pointer-events: none;
  transition: all var(--transition-fast);
  height: 100%;
  align-items: center;

  ${CardContainer}:hover & {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(-50%) translateX(0);
    background: linear-gradient(90deg, rgba(240,250,249,0) 0%, var(--color-primary-50) 30%, var(--color-primary-50) 100%);
  }

  @media (max-width: 768px) {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(-50%) translateX(0);
    background: linear-gradient(90deg, rgba(255,255,255,0) 0%, var(--color-surface) 35%, var(--color-surface) 100%);
    
    ${CardContainer}:hover & {
      background: linear-gradient(90deg, rgba(240,250,249,0) 0%, var(--color-primary-50) 35%, var(--color-primary-50) 100%);
    }
  }
`;

const ActionButton = styled.button`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: white;
  color: ${({ $danger }) => ($danger ? "#ef4444" : "var(--color-text-secondary)")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all var(--transition-fast);

  &:hover {
    background: ${({ $danger }) => ($danger ? "#fff5f5" : "var(--color-primary-50)")};
    border-color: ${({ $danger }) => ($danger ? "#fecaca" : "var(--color-primary-100)")};
    color: ${({ $danger }) => ($danger ? "#dc2626" : "var(--color-primary)")};
    transform: scale(1.05);
  }
`;

