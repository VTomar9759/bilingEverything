import { Table } from "antd";
import styled from "styled-components";
import CustomPagination from "./CustomPagination";

const index = ({ loading, columns, data, pagination }) => {
  return (
    <>
      <Wrapper>
        <StyledTable
          columns={columns}
          dataSource={data}
          pagination={false}
          loading={loading}
          rowKey="key"
        />
      </Wrapper>
      <TableFooter>
        <CustomPagination
          page={pagination?.page || 1}
          pageSize={pagination?.pageSize || 1}
          totalPages={pagination?.totalPages || 3}
          onChange={(p, ps) => pagination?.onChange(p, ps)}
        />
      </TableFooter>
    </>
  );
};

export default index;
const Wrapper = styled.div`
  background: #ffffff;
  padding: 16px;
  border-radius: var(--radius-md);
`;

const StyledTable = styled(Table)`
  .ant-table {
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .ant-table-thead > tr > th {
    font-family: Collection/Primary;
    font-weight: 700;
    font-style: Bold;
    line-height: 150%;
    letter-spacing: 0%;
    vertical-align: middle;
    text-transform: uppercase;
    border-bottom: 1px solid #e0e0e0;
    color: #000000;
  }
  :where(.css-dev-only-do-not-override-mncuj7).ant-table-wrapper
    .ant-table-thead
    > tr
    > th,
  :where(.css-dev-only-do-not-override-mncuj7).ant-table-wrapper
    .ant-table-thead
    > tr
    > td {
    position: relative;
    text-align: start;
    background: #ffffff !important;
    border-bottom: none;
  }

  .ant-table-tbody > tr:nth-child(odd) > td {
    background: #ffffff;
  }

  .ant-table-tbody > tr:nth-child(even) > td {
    background: #f7f7f7;
  }

  .ant-table-tbody > tr > td {
    font-family: Collection/Primary;
    font-weight: 500;
    font-style: Medium;
    font-size: 13.5px;
    line-height: 150%;
    letter-spacing: 0%;
    vertical-align: middle;
    border-bottom: none !important;
    color: ${({ theme }) => theme.colors.black};
  }
`;

const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
`;
