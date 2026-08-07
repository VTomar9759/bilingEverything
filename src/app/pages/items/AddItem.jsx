import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Select,
  Upload,
  Switch,
  message,
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
  FileTextOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { addItem } from "../../../services";
import { useDispatch, useSelector } from "react-redux";
import useImageUpload from "../../hooks/useImageUpload";
import { clearItems } from "../../store/slices/itemSlice";
import { PATH_ITEMS } from "../../routes/pathname";

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
import useCategories from "../../hooks/useCategories";
import useOrgData from "../../hooks/useOrgData";

const { Option } = Select;

const AddItem = () => {
  const [file, setFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const { categories } = useCategories();
  const { handleUpload, beforeUpload, uploading } = useImageUpload();
  const { org_id, gst_number, created_by, userData } = useOrgData();


  const hasGst = Boolean(
    gst_number && String(gst_number).trim().length > 0
  );


  React.useEffect(() => {
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

    const payload = {
      name: values.name,
      code: values.code,
      image: imageUrl,
      category_id: values.category_id || values.category || null,
      price: values.price !== undefined && values.price !== null ? String(values.price) : null,
      title: values.title,
      description: values.description,
      gst_status: hasGst ? Boolean(values.gst_status ?? true) : false,
      status: values.status ?? true,
      org_id: org_id,
    };

    try {
      await addItem(org_id, payload);
      dispatch(clearItems());
      message.success("Product added successfully");
      navigate(PATH_ITEMS);
      form.resetFields();
    } catch (err) {
      message.error(err.message || "Failed to create product");
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

  const isGstActive = hasGst && Boolean(formValues?.gst_status ?? true);

  return (
    <StyledPageWrapper>
      <TabHeader
        breadcrumb={["Items", "Add New Item"]}
        title="Create New Product"
        subtitle="Fill in the details below to add a high-quality product to your catalog."
      />

      <StyledForm
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          gst_status: hasGst ? true : false,
          status: true,
        }}
      >
        {/* Top GST & Product Status Settings Bar */}
        <TopStatusBanner>
          <div className="status-info">
            <div className="status-icon-badge">
              <PercentageOutlined />
            </div>
            <div className="status-text">
              <span className="title">Tax & Status Configuration</span>
              <span className="subtitle">Set tax applicability and product status before filling form details.</span>
            </div>
          </div>

          <div className="status-action-row">
            <div className="status-pill">
              <span className="label">GST Status:</span>
              <Form.Item name="gst_status" valuePropName="checked" noStyle>
                <Switch
                  disabled={!hasGst}
                  checkedChildren="Active"
                  unCheckedChildren="Exempt"
                />
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
              <input type="hidden" />
            </Form.Item>
            <UploadWrapper>
              <Upload
                name="image"
                listType="picture-card"
                className="image-uploader"
                showUploadList={false}
                beforeUpload={handleBeforeUpload}
              >
                {previewUrl || formValues?.image ? (
                  <PreviewImage src={previewUrl || formValues.image} alt="preview" />
                ) : (
                  uploadButton
                )}
              </Upload>

              {(previewUrl || formValues?.image) && !uploading && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => {
                    form.setFieldsValue({ image: undefined });
                    setFile(null);
                    setPreviewUrl(null);
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
          <CancelButton icon={<ArrowLeftOutlined />} onClick={() => navigate(PATH_ITEMS)}>
            Back
          </CancelButton>
          <SubmitButton type="primary" htmlType="submit" icon={<SaveOutlined />} loading={uploading}>
            Create Product
          </SubmitButton>
        </FormFooter>
      </StyledForm>
    </StyledPageWrapper>
  );
};

export default AddItem;
