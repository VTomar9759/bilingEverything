import { useDispatch, useSelector } from "react-redux";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { toggleTheme } from "../app/store/slices/themeSlice";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.themeSlice.currentTheme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  return (
    <StyledButton
      onClick={handleToggle}
      $mode={currentTheme}
      aria-label={`Switch to ${currentTheme === "light" ? "dark" : "light"} theme`}
    >
      {currentTheme === "light" ? <MoonOutlined  /> : <SunOutlined />}
    </StyledButton>
  );
};

export default ThemeToggle;
const StyledButton = styled.div`
  border: none;
  background: transparent;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  /* color: ${({ theme }) => theme.colors.themeChange}; */

  &:hover {
    transform: scale(1.4);
  }
`;
