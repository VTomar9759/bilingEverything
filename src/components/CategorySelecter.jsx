import styled from "styled-components";
import { AppstoreOutlined } from "@ant-design/icons";
import useCategories from "../app/hooks/useCategories";

const CategorySelecter = ({ onChange, value }) => {
  const { categories } = useCategories();

  const handleCategoryFilter = (category) => {
    if (onChange) {
      onChange(category);
    }
  };

  return (
    <Container>
      <ButtonCategory
        $active={value === "all"}
        onClick={() => handleCategoryFilter("all")}
      >
        <AppstoreOutlined style={{ fontSize: "12px" }} />
        All Items
      </ButtonCategory>
      {categories?.map((category, index) => {
        return (
          <ButtonCategory
            $active={category?.id === value}
            onClick={() => handleCategoryFilter(category?.id)}
            key={index}
          >
            {category?.name}
          </ButtonCategory>
        );
      })}
    </Container>
  );
};

export default CategorySelecter;

const Container = styled.div`
  display: flex;
  gap: 10px;
  padding: 8px;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  &::-webkit-scrollbar {
    display: none; /* WebKit */
  }

  /* Support smooth touch-scrolling */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
`;

const ButtonCategory = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 8px;
  font-family: "Plus Jakarta Sans", "Inter", sans-serif;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid
    ${(props) =>
      props.$active ? "var(--color-primary)" : "var(--color-border)"};
  background: ${(props) =>
    props.$active ? "var(--color-primary)" : "var(--color-surface)"};
  color: ${(props) =>
    props.$active ? "#ffffff" : "var(--color-text-secondary)"};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease-in-out;
  box-shadow: ${(props) =>
    props.$active ? "0 4px 12px rgba(1, 81, 75, 0.15)" : "var(--shadow-xs)"};

  &:hover {
    border-color: var(--color-primary-light);
    color: ${(props) => (props.$active ? "#ffffff" : "var(--color-primary)")};
    background: ${(props) =>
      props.$active ? "var(--color-primary)" : "var(--color-primary-50)"};
    box-shadow: ${(props) =>
      props.$active
        ? "0 6px 16px rgba(1, 81, 75, 0.22)"
        : "0 4px 8px rgba(1, 81, 75, 0.05)"};
  }

  &:active {
    transform: translateY(0);
  }
`;
