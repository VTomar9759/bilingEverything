import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Select,
  Upload,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  PlusOutlined,
  LoadingOutlined,
  DollarCircleOutlined,
  TagOutlined,
  AlignLeftOutlined,
  BarcodeOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import TabHeader from "../../../components/TabHeader";
import { addItem } from "../../../services";
import { useDispatch, useSelector } from "react-redux";
import useImageUpload from "../../hooks/useImageUpload";
import { clearItems } from "../../store/slices/itemSlice";

import {
  StyledPageWrapper,
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

const { Option } = Select;

const AddItem = () => {
  const [file, setFile] = React.useState(null);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const { userId } = useSelector((state) => state?.authSlice);
  const { handleUpload, beforeUpload, uploading } = useImageUpload();

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
      category: values.category,
      price: values.price,
      title: values.title,
      description: values.description,
    };

    try {
      await addItem(userId, payload);
      dispatch(clearItems());
      message.success("Product added successfully");
      navigate(-1);
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
      <p>{uploading ? "Uploading..." : "Click to upload"}</p>
      <span>PNG, JPG up to 5MB</span>
    </UploadPlaceholder>
  );

  return (
    <StyledPageWrapper>
      <TabHeader
        breadcrumb={["Items", "Add New Item"]}
        title="Create New Product"
        subtitle="Fill in the details below to add a product to your catalog."
      />

      <StyledForm
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{ category: "Electronics" }}
      >
        <BoxSection>
          {/* Media column */}
          <SectionCard title="Product Image">
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
                  Remove image
                </button>
              )}
            </UploadWrapper>
          </SectionCard>

          {/* Form column */}
          <FormColumn>
            <SectionCard title="Basic Information">
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
                name="category"
                rules={[{ required: true, message: "Category is required" }]}
              >
                <StyledSelect placeholder="Select category">
                  <Option value="Electronics">Electronics</Option>
                  <Option value="Fashion">Fashion</Option>
                  <Option value="Home">Home</Option>
                  <Option value="Food">Food</Option>
                  <Option value="Other">Other</Option>
                </StyledSelect>
              </Form.Item>
            </SectionCard>

            <SectionCard title="Pricing & Details">
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
                  placeholder="Describe your product's key features and benefits..."
                />
              </Form.Item>
            </SectionCard>
          </FormColumn>
        </BoxSection>

        <FormFooter>
          <CancelButton icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
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
