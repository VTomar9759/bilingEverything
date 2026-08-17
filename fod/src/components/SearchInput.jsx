import { useState, useEffect } from "react";
import styled from "styled-components";

export default function InputSearch({ onSearch, width = "280px", placeholder = "Search..." }) {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), 220);
    return () => clearTimeout(handler);
  }, [value]);

  useEffect(() => {
    onSearch?.(debouncedValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const clearInput = () => {
    setValue("");
    onSearch?.("");
  };

  return (
    <SearchWrapper style={{ width }} $focused={isFocused}>
      <SearchIcon $focused={isFocused}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </SearchIcon>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label="Search"
      />

      {value && (
        <ClearBtn onClick={clearInput} aria-label="Clear search">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </ClearBtn>
      )}
    </SearchWrapper>
  );
}

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  height: 38px;
  padding: 0 12px;
  border: 1.5px solid ${({ $focused }) => ($focused ? "var(--color-primary)" : "var(--color-border)")};
  box-shadow: ${({ $focused }) => ($focused ? "0 0 0 3px rgba(1,81,75,0.08)" : "var(--shadow-xs)")};
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-primary-100);
  }

  input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13.5px;
    font-family: var(--font-sans);
    color: var(--color-text-primary);
    background: transparent;
    min-width: 0;

    &::placeholder {
      color: var(--color-text-muted);
    }
  }
`;

const SearchIcon = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ $focused }) => ($focused ? "var(--color-primary)" : "var(--color-text-muted)")};
  transition: color var(--transition-base);
`;

const ClearBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-border);
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  flex-shrink: 0;
  transition: all var(--transition-fast);

  &:hover {
    background: var(--color-text-muted);
    color: white;
  }
`;
