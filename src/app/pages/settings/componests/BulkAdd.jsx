import React, { useRef, useState } from "react";
import styled from "styled-components";
import { Button, message, Spin } from "antd";
import {
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import useOrgData from "../../../hooks/useOrgData";
import { clearItems } from "../../../store/slices/itemSlice";
import {
  downloadCSVTemplate,
  downloadAllItemsCSV,
  processBulkItemsCSV,
} from "../../../../services/bulkAddServices";

const BulkAdd = () => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const { org_id, permission } = useOrgData();
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const itemsPerm = permission?.items_catalog;
  const canCreate = itemsPerm?.create ?? true;

  const handleDownloadTemplate = () => {
    try {
      downloadCSVTemplate();
      message.success("CSV Template downloaded successfully.");
    } catch (err) {
      message.error("Failed to download CSV template: " + err.message);
    }
  };

  const handleDownloadAllItems = async () => {
    if (!org_id) {
      message.error("Organization ID not found.");
      return;
    }
    setExporting(true);
    try {
      await downloadAllItemsCSV(org_id);
      message.success("All items exported to CSV successfully.");
    } catch (err) {
      message.error("Failed to export items: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  const handleUploadClick = () => {
    if (!canCreate) {
      message.error("You do not have permission to upload items.");
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      message.error("Please upload a valid CSV file (.csv).");
      return;
    }

    setUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvText = event.target?.result;
      try {
        const result = await processBulkItemsCSV(org_id, csvText);

        dispatch(clearItems());

        const catMsg =
          result.createdCategoriesCount > 0
            ? ` and created ${result.createdCategoriesCount} new category(ies)`
            : "";

        message.success(
          `Successfully uploaded ${result.insertedCount} product(s)${catMsg}!`,
          5
        );

        if (result.errors && result.errors.length > 0) {
          message.warning(
            `Note: ${result.errors.length} row(s) had issues and were skipped.`,
            6
          );
        }
      } catch (err) {
        message.error(err.message || "Failed to process CSV file.");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.onerror = () => {
      message.error("Failed to read the selected CSV file.");
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };

    reader.readAsText(file);
  };

  return (
    <BulkAddWrapper>
      {/* CSV Requirements Card */}
      <RequirementsCard>
        <CardTitle>CSV REQUIREMENTS</CardTitle>
        <RequirementsList>
          <li>
            <strong>name</strong> — Required product name
          </li>
          <li>
            <strong>code</strong> — Product code (optional)
          </li>
          <li>
            <strong>category</strong> — Category name (auto-created if new)
          </li>
          <li>
            <strong>price</strong> — Required, must be 0 or greater
          </li>
          <li>
            <strong>title</strong> — Short title (optional)
          </li>
          <li>
            <strong>description</strong> — Product description (optional)
          </li>
          <li>
            <strong>status</strong> — active or deactivated
          </li>
          <li>Do not change the column names</li>
        </RequirementsList>
      </RequirementsCard>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Action Buttons Row */}
      <ActionsRow>
        <SecondaryActionButton
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
        >
          Download CSV Template
        </SecondaryActionButton>

        <SecondaryActionButton
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleDownloadAllItems}
        >
          Download All Items CSV
        </SecondaryActionButton>

        <PrimaryUploadButton
          type="primary"
          icon={<UploadOutlined />}
          loading={uploading}
          onClick={handleUploadClick}
        >
          Upload CSV
        </PrimaryUploadButton>
      </ActionsRow>
    </BulkAddWrapper>
  );
};

export default BulkAdd;

/* ─── Styled Components ─── */

const BulkAddWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
`;

const RequirementsCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 18px 22px;
`;

const CardTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #1e293b;
  text-transform: uppercase;
`;

const RequirementsList = styled.ul`
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.5;

    strong {
      color: #0f172a;
      font-weight: 600;
    }
  }
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const SecondaryActionButton = styled(Button)`
  height: 42px;
  padding: 0 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  color: #1f2937;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af !important;
    color: #111827 !important;
    background: #f9fafb !important;
  }
`;

const PrimaryUploadButton = styled(Button)`
  height: 42px;
  padding: 0 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  background: #2563eb;
  border: 1px solid #2563eb;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 3px 0 rgba(37, 99, 235, 0.2);
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8 !important;
    border-color: #1d4ed8 !important;
  }
`;