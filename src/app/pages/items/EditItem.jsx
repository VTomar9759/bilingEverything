import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Upload,
  Switch,
  message,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  LoadingOutlined,
  DollarCircleOutlined,
  TagOutlined,
  AlignLeftOutlined,
  BarcodeOutlined,
  PictureOutlined,
  PercentageOutlined,
  AppstoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { getItemById, updateItem, supabase } from "../../../services";
import { useDispatch, useSelector } from "react-redux";
import useImageUpload from "../../hooks/useImageUpload";
import useCategories from "../../hooks/useCategories";
import { clearItems } from "../../store/slices/itemSlice";

import {
  StyledPageWrapper,
  TopStatusBanner,
  BoxSection,
  SectionCard,
  FormColumn,
  StyledForm,
  StyledInput,
  StyledInputNumber,
  StyledSelect,
  StyledTextArea,
  UploadWrapper,
  UploadPlaceholder,
  PreviewImage,
  FormFooter,
  CancelButton,
  SubmitButton,
} from "./components/FormStyles";
import styled from "styled-components";

const { Option } = Select;

const LoadingCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: var(--color-text-muted);

  p {
    font-size: 14px;
    font-weight: 500;
  }
`;

const EditItem = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [oldImageUrl, setOldImageUrl] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const { userId, org_id } = useSelector((state) => state?.authSlice || {});
  const activeOrgId = org_id || userId;
  const { categories } = useCategories();
  const { handleUpload, beforeUpload, uploading } = useImageUpload();

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      setPageLoading(true);
      try {
        const data = await getItemById(id);

        if (data) {
          setOldImageUrl(data.image);
          setCurrentImageUrl(data.image);
          form.setFieldsValue({
            name: data.name,
            code: data.code,
            category_id: data.category_id,
            price: data.price,
            gst_status: data.gst_status ?? true,
            title: data.title,
            description: data.description,
            image: data.image,
          });
        }
      } catch (err) {
        message.error("Failed to load item details");
      } finally {
        setPageLoading(false);
      }
    };
    fetchItem();
  }, [id, form]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleBeforeUpload = (file) => {
    const isValid = beforeUpload(file);
    if (isValid) {
      setFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
    return false;
  };

  const onFinish = async (values) => {
    let imageUrl = values.image;

    if (file) {
      try {
        const uploadedUrl = await handleUpload({ file });
        if (uploadedUrl) imageUrl = uploadedUrl;
      } catch {
        message.error("Image upload failed");
        return;
      }
    }

    // Delete old image from storage if changed
    if (oldImageUrl && oldImageUrl !== imageUrl) {
      const parts = oldImageUrl.split("items-images/");
      if (parts.length === 2) {
        const filePath = parts[1].split("?")[0];
        await supabase.storage.from("items-images").remove([filePath]);
      }
    }

    const payload = {
      name: values.name,
      code: values.code,
      image: imageUrl !== undefined ? imageUrl : null,
      category_id: values.category_id || null,
      price: values.price !== undefined && values.price !== null ? String(values.price) : null,
      gst_status: values.gst_status ?? true,
      title: values.title,
      description: values.description,
      org_id: activeOrgId,
    };

    try {
      await updateItem(activeOrgId, id, payload);
      dispatch(clearItems());
      message.success("Product updated successfully");
      navigate(-1);
    } catch (err) {
      message.error(err.message || "Failed to update product");
    }
  };

  const uploadButton = (
    <UploadPlaceholder>
      <div className="upload-icon">
        {uploading ? <LoadingOutlined /> : <PictureOutlined />}
      </div>
      <p>{uploading ? "Uploading Image..." : "Click or Drag Image Here"}</p>
      <span>PNG, JPG up to 5MB</span>
    </UploadPlaceholder>
  );

  if (pageLoading) {
    return (
      <StyledPageWrapper>
        <LoadingCenter>
          <Spin size="large" />
          <p>Loading item details...</p>
        </LoadingCenter>
      </StyledPageWrapper>
    );
  }

  const isGstActive = formValues?.gst_status ?? true;

  return (
    <StyledPageWrapper>
      <TabHeader
        breadcrumb={["Items", "Edit Item"]}
        title="Edit Product"
        subtitle="Update the details and tax configurations of your product below."
      />

      <StyledForm
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          gst_status: true,
        }}
      >
        {/* Top GST Status Configuration Banner */}
        <TopStatusBanner>
          <div className="status-info">
            <div className="status-icon-badge">
              <PercentageOutlined />
            </div>
            <div className="status-text">
              <span className="title">Tax & Status Configuration</span>
              <span className="subtitle">Configure tax applicability and product status.</span>
            </div>
          </div>

          <div className="status-action-row">
            <div className="status-pill">
              <span className="label">GST Status:</span>
              <Form.Item name="gst_status" valuePropName="checked" noStyle>
                <Switch checkedChildren="Active" unCheckedChildren="Exempt" />
              </Form.Item>
              <span className={`badge-tag ${isGstActive ? "active" : "inactive"}`}>
                {isGstActive ? "GST Applicable" : "Non-GST / Exempt"}
              </span>
            </div>
          </div>
        </TopStatusBanner>

        <BoxSection>
          {/* Media Column */}
          <SectionCard
            title={
              <>
                <PictureOutlined />
                <span>Product Image</span>
              </>
            }
          >
            <Form.Item name="image" noStyle>
              <Input type="hidden" />
            </Form.Item>
            <UploadWrapper>
              <Upload
                name="image"
                listType="picture-card"
                className="image-uploader"
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
              >
                {previewUrl || currentImageUrl ? (
                  <PreviewImage src={previewUrl || currentImageUrl} alt="preview" />
                ) : (
                  uploadButton
                )}
              </Upload>

              {(previewUrl || currentImageUrl) && !uploading && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => {
                    form.setFieldsValue({ image: null });
                    setFile(null);
                    setPreviewUrl(null);
                    setCurrentImageUrl(null);
                  }}
                >
                  <DeleteOutlined /> Remove Image
                </button>
              )}
            </UploadWrapper>
          </SectionCard>

          {/* Form Inputs Column */}
          <FormColumn>
            <SectionCard
              title={
                <>
                  <AppstoreOutlined />
                  <span>Basic Information</span>
                </>
              }
            >
              <div className="form-row">
                <Form.Item
                  label="Product Name"
                  name="name"
                  rules={[{ required: true, message: "Product name is required" }]}
                >
                  <StyledInput prefix={<TagOutlined />} placeholder="e.g. Wireless Headphones" />
                </Form.Item>

                <Form.Item
                  label="Product Code"
                  name="code"
                  rules={[{ required: true, message: "Product code is required" }]}
                >
                  <StyledInput prefix={<BarcodeOutlined />} placeholder="e.g. PRD-001" />
                </Form.Item>
              </div>

              <Form.Item
                label="Category"
                name="category_id"
                rules={[{ required: true, message: "Category is required" }]}
              >
                <StyledSelect placeholder="Select category">
                  {categories?.length > 0 ? (
                    categories?.map((cat) => (
                      <Option key={cat.id} value={cat.id}>
                        {cat.name}
                      </Option>
                    ))
                  ) : (
                    <Option value="">No Category Found</Option>
                  )}
                </StyledSelect>
              </Form.Item>
            </SectionCard>

            <SectionCard
              title={
                <>
                  <DollarCircleOutlined />
                  <span>Pricing & Product Details</span>
                </>
              }
            >
              <div className="form-row">
                <Form.Item
                  label="Price (Rs.)"
                  name="price"
                  rules={[{ required: true, message: "Price is required" }]}
                >
                  <StyledInputNumber
                    prefix={<DollarCircleOutlined />}
                    min={0}
                    placeholder="0"
                    formatter={(v) => `Rs. ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(v) => v.replace(/Rs\.\s?|(,*)/g, "")}
                  />
                </Form.Item>

                <Form.Item
                  label="Short Title"
                  name="title"
                  rules={[{ required: true, message: "Short title is required" }]}
                >
                  <StyledInput prefix={<AlignLeftOutlined />} placeholder="e.g. Premium Quality" />
                </Form.Item>
              </div>

              <Form.Item
                label="Description"
                name="description"
                rules={[{ required: true, message: "Description is required" }]}
              >
                <StyledTextArea
                  rows={4}
                  placeholder="Describe your product's key features and specifications..."
                />
              </Form.Item>
            </SectionCard>
          </FormColumn>
        </BoxSection>

        <FormFooter>
          <CancelButton icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            Back
          </CancelButton>
          <SubmitButton
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={uploading || pageLoading}
          >
            Update Product
          </SubmitButton>
        </FormFooter>
      </StyledForm>
    </StyledPageWrapper>
  );
};

export default EditItem;
