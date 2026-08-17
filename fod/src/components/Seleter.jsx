import { Select } from "antd";
import styled from "styled-components";

const { Option } = Select;

const Seleter = ({ defaultValue, options, onChange }) => {
  return (
    <Wrapper>
      <Select
        defaultValue={defaultValue}
        onChange={onChange}
        className="custom-select"
      >
        {options.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </Wrapper>
  );
};

export default Seleter;

const Wrapper = styled.div`
  
  .custom-select.ant-select {
     background: #fff;
    width: 200px;
    border-radius: 10px;
    border: 1px solid #d8d8d8;
    height: 42px;
  }

  .custom-select .ant-select-selector {
    height: 42px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    box-shadow: none;
    border: none;
    background: transparent;
  }

  .custom-select .ant-select-selection-placeholder {
    color: #9e9e9e;
    font-size: 14px;
  }

  .custom-select .ant-select-selection-item {
    color: #666;
    font-size: 14px;
  }

  /* Hover */
  .custom-select.ant-select:hover {
    border-color: #ccc;
  }

  /* Focus */
  .custom-select.ant-select-focused {
    border-color: red;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.15);
  }
`;
