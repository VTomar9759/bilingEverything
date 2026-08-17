import { Pagination } from "antd";
import styled from "styled-components";

const CustomPagination = ({
  page = 1,
  totalPages = 10,
  pageSize = 10,
  onChange,
}) => {
  // convert pages -> items for antd
  const totalItems = totalPages * pageSize;

  const handlePrevious = () => {
    if (page > 1) {
      onChange(page - 1, pageSize);
    }
  };

  const handleNext = () => {
    const lastPage = Math.ceil(totalItems / pageSize);

    if (page < lastPage) {
      onChange(page + 1, pageSize);
    }
  };

  return (
    <Wrapper>
      <NavText onClick={handlePrevious} disabled={page <= 1}>
        ← Previous
      </NavText>

      <StyledPagination
        size="large"
        current={page}
        pageSize={pageSize}
        total={totalItems} // ✅ IMPORTANT FIX
        onChange={onChange}
        showSizeChanger={false}
      />

      <NavText
        onClick={handleNext}
        disabled={page >= Math.ceil(totalItems / pageSize)}
      >
        Next →
      </NavText>
    </Wrapper>
  );
};

export default CustomPagination;
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  padding: 0px 5px;
`;

const NavText = styled.span`
  font-weight: 500;
  font-size: 16px;
  line-height: 150%;
  letter-spacing: 0%;
  cursor: pointer;
  color: #000;

  &:hover {
    color: #000;
  }

  &:disabled,
  &[disabled] {
    cursor: not-allowed;
    color: #ccc;
    pointer-events: none;
  }
`;

const StyledPagination = styled(Pagination)`
  .ant-pagination-item {
    border: none;
    background: transparent;
    color: #000000;
    min-width: 38px;
    height: 38px;
    line-height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  .ant-pagination-item a {
    color: inherit;
  }

  .ant-pagination-item-active {
    background: ${({ theme }) => theme.colors.primary};
    font-family: text/Body;
    font-weight: 500;
    font-style: Medium;
    font-size: 18px;
    line-height: 150%;
    letter-spacing: 0%;
  }

  .ant-pagination-item-active a {
    color: #fff;
  }

  .ant-pagination-prev,
  .ant-pagination-next {
    display: none; /* hide default arrows */
  }
`;
