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
  background: var(--color-surface);
  padding: 8px 10px;
  border-radius: var(--radius-md);
`;

const StyledTable = styled(Table)`
  .ant-table {
    border-radius: var(--radius-md);
    overflow: hidden;
  }

  .ant-table-thead > tr > th {
    font-family: var(--font-sans);
    font-weight: 700;
    font-size: 11.5px;
    padding: 8px 10px !important;
    line-height: 140%;
    letter-spacing: 0%;
    vertical-align: middle;
    text-transform: uppercase;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-primary);
  }

  .ant-table-tbody > tr:nth-child(odd) > td {
    background: var(--color-surface);
  }

  .ant-table-tbody > tr:nth-child(even) > td {
    background: var(--color-bg);
  }

  .ant-table-tbody > tr > td {
    font-family: var(--font-sans);
    font-weight: 500;
    font-size: 12.5px;
    padding: 6px 10px !important;
    line-height: 140%;
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
  padding-top: 8px;
`;
