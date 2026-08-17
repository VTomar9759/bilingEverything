import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Form, Input, Select, Button, Empty, message } from "antd";
import {
  ShoppingCartOutlined,
  SearchOutlined,
  CoffeeOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useOrders from "../../hooks/useOrders";
import useTables from "../../hooks/useTables";
import useSettings from "../../hooks/useSettings";
import useItemStore from "../../hooks/useItemStore";
import TabHeader from "../../../components/TabHeader";
import { PageWrapper } from "../../styles/commonstyle";
import { TABLE_STATUS } from "../../utils/constant";

const { Option } = Select;

const PosOrderComposer = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrders();
  const { tables = [] } = useTables();
  const { settings = {} } = useSettings();
  const [catalogItems, catalogLoading] = useItemStore({
    search: "",
    filter: "",
  });

  const [form] = Form.useForm();
  const [selectedPosItems, setSelectedPosItems] = useState([]); // Array of { item, quantity }
  const [posSearchText, setPosSearchText] = useState("");

  useEffect(() => {
    const availableTables = tables.filter(
      (t) => t.status === TABLE_STATUS.available,
    );
    if (availableTables.length > 0 && !form.getFieldValue("table_id")) {
      form.setFieldsValue({ table_id: availableTables[0].id });
    }
  }, [tables, form]);

  const handleAddPosItem = (item) => {
    const existing = selectedPosItems.find((i) => i.item.id === item.id);
    if (existing) {
      setSelectedPosItems(
        selectedPosItems.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setSelectedPosItems([...selectedPosItems, { item, quantity: 1 }]);
    }
  };

  const handleAdjustPosQty = (itemId, amount) => {
    const updated = selectedPosItems
      .map((i) => {
        if (i.item.id === itemId) {
          const nextQty = i.quantity + amount;
          return nextQty > 0 ? { ...i, quantity: nextQty } : null;
        }
        return i;
      })
      .filter(Boolean);
    setSelectedPosItems(updated);
  };

  const handleSubmit = async (values) => {
    if (selectedPosItems.length === 0) {
      message.warning("Please add at least one item to composition.");
      return;
    }

    const subtotal = selectedPosItems.reduce(
      (acc, curr) => acc + curr.item.price * curr.quantity,
      0,
    );
    const tax = subtotal * ((settings.tax_rate || 18) / 100);
    const service_charge =
      subtotal * ((settings.service_charge_rate || 5) / 100);
    const total = subtotal + tax + service_charge;

    const tableId = values.table_id;
    const selectedTable = tables.find((t) => t.id === tableId);

    const payload = {
      table_id: tableId || null,
      table_name: selectedTable ? selectedTable.name : "Takeaway",
      items: selectedPosItems.map((i) => ({
        id: i.item.id,
        name: i.item.name,
        price: i.item.price,
        quantity: i.quantity,
        category: i.item.category || "Food",
      })),
      subtotal,
      tax,
      service_charge,
      discount: 0,
      total,
      status: "Pending",
    };

    try {
      await createOrder(payload);
      message.success("POS order placed successfully!");
      form.resetFields();
      setSelectedPosItems([]);
      navigate("/dashboard/orders");
    } catch (err) {
      message.error("Failed to compose order");
      console.error(err);
    }
  };

  const menuFilteredCatalog = catalogItems?.filter(
    (item) =>
      item.name?.toLowerCase().includes(posSearchText.toLowerCase()) ||
      item.code?.toLowerCase().includes(posSearchText.toLowerCase()),
  );

  const subtotalSum = selectedPosItems.reduce(
    (acc, curr) => acc + curr.item.price * curr.quantity,
    0,
  );
  const taxSum = subtotalSum * ((settings.tax_rate || 18) / 100);
  const serviceSum = subtotalSum * ((settings.service_charge_rate || 5) / 100);
  const grandTotal = subtotalSum + taxSum + serviceSum;
  console.log(tables, "ddddddddd");
  return (
    <PageWrapper>
      <HeaderBox>
        <TabHeader
          breadcrumb={["Orders", "Composer"]}
          title="POS New Order Composer"
          subtitle="Select dining table, search menu dishes, and compile order ticket."
        />
      </HeaderBox>

      <ComposerCard>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <PosContainer>
            {/* Left Column - Selection Grid */}
            <PosLeftPanel>
              <Form.Item
                name="table_id"
                label="Assign Dining Table"
                rules={[
                  {
                    required: true,
                    message: "Please select destination table",
                  },
                ]}
              >
                <Select
                  placeholder="Choose dining table"
                  style={{ height: 38 }}
                >
                  {tables
                    .filter((t) => t.status === TABLE_STATUS.available)
                    ?.map((t) => (
                      <Option key={t.id} value={t.id}>
                        {t.table_name} ({t.capacity} seats) {t.table_number}{" "}
                        {t.section_name} {t.location}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <SearchBox>
                <Input
                  placeholder="Filter menu dishes..."
                  prefix={<SearchOutlined />}
                  value={posSearchText}
                  onChange={(e) => setPosSearchText(e.target.value)}
                  style={{ height: 38, borderRadius: 8 }}
                />
              </SearchBox>

              <MenuGrid>
                {catalogLoading ? (
                  <p>Loading items catalog...</p>
                ) : menuFilteredCatalog?.length === 0 ? (
                  <Empty description="No menu items in catalog" />
                ) : (
                  menuFilteredCatalog?.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      onClick={() => handleAddPosItem(item)}
                    >
                      {item.image ? (
                        <MenuImg src={item.image} alt={item.name} />
                      ) : (
                        <MenuAvatar>{item.name[0]}</MenuAvatar>
                      )}
                      <CodeBadge>{item.code}</CodeBadge>
                      <MenuCardContent>
                        <MenuMeta>
                          <MenuName>{item.name}</MenuName>

                          <MenuPrice>
                            {settings.currency || "Rs."} {item.price}
                          </MenuPrice>
                        </MenuMeta>
                      </MenuCardContent>
                    </MenuItemCard>
                  ))
                )}
              </MenuGrid>
            </PosLeftPanel>

            {/* Right Column - Composition List */}
            <PosRightPanel>
              <ComposerTitle>Composition Ticket</ComposerTitle>
              <ComposerList>
                {selectedPosItems.length === 0 ? (
                  <ComposerEmpty>
                    <CoffeeOutlined
                      style={{
                        fontSize: 40,
                        color: "var(--color-text-secondary)",
                      }}
                    />
                    <p>
                      No composed dishes yet.
                      <br />
                      Click items on the left to add.
                    </p>
                  </ComposerEmpty>
                ) : (
                  selectedPosItems.map(({ item, quantity }) => (
                    <ComposedItem key={item.id}>
                      <div>
                        <CompName>{item.name}</CompName>
                        <CompPrice>
                          {settings.currency || "Rs."} {item.price}
                        </CompPrice>
                      </div>
                      <QtyControls>
                        <Button
                          size="small"
                          onClick={() => handleAdjustPosQty(item.id, -1)}
                        >
                          -
                        </Button>
                        <span>{quantity}</span>
                        <Button
                          size="small"
                          onClick={() => handleAdjustPosQty(item.id, 1)}
                        >
                          +
                        </Button>
                      </QtyControls>
                    </ComposedItem>
                  ))
                )}
              </ComposerList>

              <ComposerSummary>
                <SummaryRow>
                  <span>Subtotal</span>
                  <span>
                    {settings.currency || "Rs."} {subtotalSum.toFixed(2)}
                  </span>
                </SummaryRow>
                <SummaryRow>
                  <span>Tax ({settings.tax_rate || 18}%)</span>
                  <span>
                    {settings.currency || "Rs."} {taxSum.toFixed(2)}
                  </span>
                </SummaryRow>
                <SummaryRow>
                  <span>Service ({settings.service_charge_rate || 5}%)</span>
                  <span>
                    {settings.currency || "Rs."} {serviceSum.toFixed(2)}
                  </span>
                </SummaryRow>
                <DashedLine />
                <SummaryRow
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "var(--color-primary)",
                  }}
                >
                  <span>Grand Total</span>
                  <span>
                    {settings.currency || "Rs."} {grandTotal.toFixed(2)}
                  </span>
                </SummaryRow>

                <Button
                  type="primary"
                  block
                  htmlType="submit"
                  disabled={selectedPosItems.length === 0}
                  style={{
                    height: 42,
                    fontWeight: 700,
                    borderRadius: 10,
                    marginTop: 12,
                  }}
                >
                  Place POS Order
                </Button>
              </ComposerSummary>
            </PosRightPanel>
          </PosContainer>
        </Form>
      </ComposerCard>
    </PageWrapper>
  );
};

export default PosOrderComposer;

/* ─── Styled Components ─── */
const HeaderBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const ComposerCard = styled.div`
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-sm);
  padding: 24px;
`;
const CodeBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(15, 17, 23, 0.7);
  backdrop-filter: blur(6px);
  color: white;
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;
const PosContainer = styled.div`
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
  height: calc(100vh - 240px);
  min-height: 520px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const PosLeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  :where(.css-dev-only-do-not-override-mncuj7).ant-form-item {
    margin-bottom: 0;
  }
`;

const SearchBox = styled.div`
  width: 100%;
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
`;

const MenuItemCard = styled.div`
  position: relative;
  min-height: 150px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-sm);
  }
`;

const MenuImg = styled.img`
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-top-left-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-lg);
`;

const MenuAvatar = styled.div`
  width: 100%;
  height: 90px;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
`;

const MenuCardContent = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MenuName = styled.div`
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MenuPrice = styled.strong`
  font-size: 12px;
  color: var(--color-text-primary);
`;

const PosRightPanel = styled.div`
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const ComposerTitle = styled.h4`
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 12px;
  border-bottom: 1.5px solid var(--color-border);
  padding-bottom: 8px;
`;

const ComposerList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;
`;

const ComposerEmpty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  text-align: center;
  p {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: 1.6;
  }
`;

const ComposedItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-radius: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
`;

const CompName = styled.div`
  font-size: 12.5px;
  font-weight: 500;
  color: var(--color-text-primary);
`;

const CompPrice = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
`;

const QtyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    font-size: 13px;
    font-weight: 700;
  }
  .ant-btn {
    width: 24px;
    height: 24px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }
`;

const ComposerSummary = styled.div`
  margin-top: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12.5px;
  color: var(--color-text-secondary);
`;

const DashedLine = styled.div`
  border-top: 1px dashed var(--color-border);
  margin: 4px 0;
`;
