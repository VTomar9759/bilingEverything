import { useDispatch, useSelector } from "react-redux";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { toggleTheme } from "../app/store/slices/themeSlice";

const ThemeToggle = ({ showLabel = false, className }) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.themeSlice.currentTheme);

  const handleToggle = () => {
    dispatch(toggleTheme());
  };

  const isDark = currentTheme === "dark";

  return (
    <Wrapper onClick={handleToggle} className={className} title={`Switch to ${isDark ? "light" : "dark"} theme`}>
      <StyledButton
        $mode={currentTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      >
        {isDark ? (
          <SunOutlined style={{ color: "#fadb14" }} />
        ) : (
          <MoonOutlined style={{ color: "#4b5563" }} />
        )}
      </StyledButton>
      {showLabel && (
        <ThemeLabel>
          {isDark ? "Dark Theme" : "Light Theme"}
        </ThemeLabel>
      )}
    </Wrapper>
  );
};

export default ThemeToggle;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const StyledButton = styled.div`
  border: none;
  background: transparent;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.2);
  }
`;

const ThemeLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary, #333);
`;

