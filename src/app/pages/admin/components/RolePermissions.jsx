import React from "react";
import styled from "styled-components";
import { Checkbox, Tooltip } from "antd";
import {
  DashboardOutlined,
  TagsOutlined,
  TableOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  SettingOutlined,
  SafetyOutlined,
} from "@ant-design/icons";

export const MODULE_CONFIG = {
  orders: { label: "Orders", icon: <ShoppingCartOutlined /> },
  categories: { label: "Categories", icon: <TagsOutlined /> },
  tables: { label: "Tables", icon: <TableOutlined /> },
  items_catalog: { label: "Items Catalog", icon: <ShoppingOutlined /> },
  billing: { label: "Billing", icon: <CreditCardOutlined /> },
  dashboard: { label: "Dashboard", icon: <DashboardOutlined /> },
  settings: { label: "Settings", icon: <SettingOutlined /> },
};

const ACTIONS = [
  { key: "view", label: "View", short: "V" },
  { key: "create", label: "Create", short: "C" },
  { key: "update", label: "Edit", short: "E" },
  { key: "delete", label: "Delete", short: "D" },
];

const RolePermissions = ({
  permissions,
  permission,
  editable = false,
  onChange,
  showTitle = true,
}) => {
  const safePerms = permissions || permission || {};

  const handleToggleAction = (modKey, actKey, targetChecked) => {
    if (!editable || !onChange) return;
    const currentMod = safePerms[modKey] || { view: false, create: false, update: false, delete: false };

    let updatedMod = { ...currentMod };

    if (targetChecked) {
      // Checking an action: auto-select prerequisite actions
      if (actKey === "delete") {
        updatedMod = { view: true, create: true, update: true, delete: true };
      } else if (actKey === "update") {
        updatedMod = { ...updatedMod, view: true, create: true, update: true };
      } else if (actKey === "create") {
        updatedMod = { ...updatedMod, view: true, create: true };
      } else if (actKey === "view") {
        updatedMod = { ...updatedMod, view: true };
      }
    } else {
      // Unchecking an action: auto-unselect dependent higher actions
      if (actKey === "view") {
        updatedMod = { view: false, create: false, update: false, delete: false };
      } else if (actKey === "create") {
        updatedMod = { ...updatedMod, create: false, update: false, delete: false };
      } else if (actKey === "update") {
        updatedMod = { ...updatedMod, update: false, delete: false };
      } else if (actKey === "delete") {
        updatedMod = { ...updatedMod, delete: false };
      }
    }

    onChange({
      ...safePerms,
      [modKey]: updatedMod,
    });
  };

  const handleToggleModule = (modKey, checked) => {
    if (!editable || !onChange) return;
    onChange({
      ...safePerms,
      [modKey]: {
        view: checked,
        create: checked,
        update: checked,
        delete: checked,
      },
    });
  };

  const handleToggleAllGlobal = (checked) => {
    if (!editable || !onChange) return;
    const newPerms = {};
    Object.keys(MODULE_CONFIG).forEach((modKey) => {
      newPerms[modKey] = {
        view: checked,
        create: checked,
        update: checked,
        delete: checked,
      };
    });
    onChange(newPerms);
  };

  const activeModules = Object.keys(MODULE_CONFIG).filter((key) => {
    const mod = safePerms[key];
    return mod && (mod.view || mod.create || mod.update || mod.delete);
  });

  const totalPossibleActions = Object.keys(MODULE_CONFIG).length * ACTIONS.length;
  let totalActiveActions = 0;
  Object.keys(MODULE_CONFIG).forEach((modKey) => {
    const m = safePerms[modKey] || {};
    ACTIONS.forEach((a) => {
      if (m[a.key]) totalActiveActions++;
    });
  });
  const isGlobalAll = totalActiveActions === totalPossibleActions;
  const isGlobalIndeterminate = totalActiveActions > 0 && totalActiveActions < totalPossibleActions;

  return (
    <Wrapper>
      {showTitle && (
        <HeaderRow>
          <SectionLabel>Permissions</SectionLabel>
          {editable ? (
            <Checkbox
              checked={isGlobalAll}
              indeterminate={isGlobalIndeterminate}
              onChange={(e) => handleToggleAllGlobal(e.target.checked)}
            >
              <MasterToggleText>Select All Modules</MasterToggleText>
            </Checkbox>
          ) : (
            <AccessCount>
              {activeModules.length} of {Object.keys(MODULE_CONFIG).length} Allowed
            </AccessCount>
          )}
        </HeaderRow>
      )}

      {editable ? (
        /* Edit / Selection Mode */
        <EditList>
          {Object.entries(MODULE_CONFIG).map(([modKey, mod]) => {
            const mPerms = safePerms[modKey] || {};
            const activeCount = ACTIONS.filter((a) => mPerms[a.key]).length;
            const isAll = activeCount === ACTIONS.length;

            return (
              <EditRow key={modKey}>
                <EditModuleHeader>
                  <ModuleInfo>
                    <IconSpan>{mod.icon}</IconSpan>
                    <ModName>{mod.label}</ModName>
                  </ModuleInfo>
                  <Checkbox
                    checked={isAll}
                    indeterminate={activeCount > 0 && activeCount < ACTIONS.length}
                    onChange={(e) => handleToggleModule(modKey, e.target.checked)}
                  >
                    <AllText>All</AllText>
                  </Checkbox>
                </EditModuleHeader>

                <ActionGroup>
                  {ACTIONS.map((act) => {
                    const checked = !!mPerms[act.key];
                    return (
                      <ActionCheckbox
                        key={act.key}
                        checked={checked}
                        onChange={(e) => handleToggleAction(modKey, act.key, e.target.checked)}
                      >
                        {act.label}
                      </ActionCheckbox>
                    );
                  })}
                </ActionGroup>
              </EditRow>
            );
          })}
        </EditList>
      ) : (
        /* Display / Read-only Mode (Simple & Professional) */
        <DisplayGrid>
          {Object.entries(MODULE_CONFIG).map(([modKey, mod]) => {
            const mPerms = safePerms[modKey] || {};
            const activeActions = ACTIONS.filter((a) => mPerms[a.key]);
            const hasAccess = activeActions.length > 0;

            return (
              <PermRow key={modKey} $active={hasAccess}>
                <RowLeft>
                  <Dot $active={hasAccess} />
                  <ModTitle $active={hasAccess}>{mod.label}</ModTitle>
                </RowLeft>

                <RowRight>
                  {hasAccess ? (
                    <PillGroup>
                      {activeActions.map((act) => (
                        <Tooltip key={act.key} title={`${act.label} ${mod.label}`}>
                          <Pill>{act.label}</Pill>
                        </Tooltip>
                      ))}
                    </PillGroup>
                  ) : (
                    <NoAccessText>No access</NoAccessText>
                  )}
                </RowRight>
              </PermRow>
            );
          })}
        </DisplayGrid>
      )}
    </Wrapper>
  );
};

export default RolePermissions;

/* ─── Styled Components ─── */
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
`;

const SectionLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

const AccessCount = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary, #01514b);
`;

const MasterToggleText = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--color-primary, #01514b);
`;

const DisplayGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const PermRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  border-radius: 6px;
  background: ${(props) => (props.$active ? "var(--color-bg, #f8fafc)" : "transparent")};
  border: 1px solid ${(props) => (props.$active ? "var(--color-border-light, #f1f5f9)" : "transparent")};
  transition: all 0.15s ease;
`;

const RowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "#10b981" : "#cbd5e1")};
`;

const ModTitle = styled.span`
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? "600" : "400")};
  color: ${(props) => (props.$active ? "var(--color-text-primary, #1e293b)" : "#94a3b8")};
`;

const RowRight = styled.div`
  display: flex;
  align-items: center;
`;

const PillGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const Pill = styled.span`
  font-size: 10px;
  font-weight: 600;
  padding: 1.5px 6px;
  border-radius: 4px;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e2e8f0);
  color: var(--color-text-secondary, #475569);
  line-height: 1.2;
`;

const NoAccessText = styled.span`
  font-size: 10.5px;
  color: #cbd5e1;
`;

/* ─── Edit Mode Styles ─── */
const EditList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const EditRow = styled.div`
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--color-border-light, #f1f5f9);
  background: var(--color-bg, #f8fafc);
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const EditModuleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ModuleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconSpan = styled.span`
  color: var(--color-primary, #01514b);
  font-size: 13px;
`;

const ModName = styled.span`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--color-text-primary, #1e293b);
`;

const AllText = styled.span`
  font-size: 11px;
  color: var(--color-text-muted, #64748b);
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 20px;
`;

const ActionCheckbox = styled(Checkbox)`
  font-size: 11.5px;
  color: var(--color-text-secondary, #475569);
`;
