import { DatePicker } from "antd";
import styled from "styled-components";

const { RangePicker } = DatePicker;

const DateRange = ({ onDateChange, dateRange }) => {
  return (
    <Wrapper>
      <RangePicker
        onChange={(dates) => {
          if (dates && dates[0] && dates[1]) {
            const formattedDates = [
              dates[0].format('YYYY-MM-DD'),
              dates[1].format('YYYY-MM-DD')
            ];
            onDateChange(formattedDates);
          } else {
            onDateChange([null, null]);
          }
        }}
        value={dateRange}
        placeholder={["Start Date", "End Date"]}
        className="custom-range"
      />
    </Wrapper>
  );
};

export default DateRange;
const Wrapper = styled.div`
  .custom-range.ant-picker {
    width: 300px;
    border-radius: 10px;
    border: 1px solid #d8d8d8;
    height: 42px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    box-shadow: none;
  }

  .custom-range .ant-picker-input > input {
    background: transparent;
    font-size: 14px;
    color: #666;
  }

  .custom-range .ant-picker-input > input::placeholder {
    color: #9e9e9e;
  }

  /* 🔥 Separator (RED ARROW LIKE IMAGE) */
  .custom-range .ant-picker-separator {
    position: relative;
    margin: 0 10px;
  }

  .custom-range .ant-picker-separator::after {
    content: "→";
    color: ${({ theme }) => theme.colors.primary};
    font-size: 16px;
    font-weight: bold;
  }

  /* Hide default dash */
  .custom-range .ant-picker-separator svg {
    display: none;
  }

  /* Calendar Icon */
  .custom-range .ant-picker-suffix {
    color: red;
  }

  /* Hover */
  .custom-range.ant-picker:hover {
    border-color: #ccc;
  }

  /* Focus */
  .custom-range.ant-picker-focused {
    border-color: red;
    box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.15);
  }
`;
