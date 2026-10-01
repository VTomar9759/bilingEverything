"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BgColorsOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { changePrimaryColor } from "../app/store/slices/themeSlice";
import { colors, colors2 } from "../app/utils/theme";

const ThemeChanger = ({
  showTrigger = true,
  isOpen: controlledIsOpen,
  handleClose,
  showLabel = true,
  label = "Theme",
  placement = "right",
  className,
}) => {
  const dispatch = useDispatch();
  const currentPrimary = useSelector((state) => state.themeSlice?.primaryColor);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef(null);

  const isControlled = typeof controlledIsOpen === "boolean";
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const closeDropdown = () => {
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    if (handleClose) {
      handleClose();
    }
  };

  const toggleDropdown = () => {
    if (!isControlled) {
      setInternalIsOpen((prev) => !prev);
    }
  };

  const handleColorSelect = (color) => {
    dispatch(changePrimaryColor(color));
    closeDropdown();
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // If used without a trigger (e.g. controlled modal or popup)
  if (!showTrigger) {
    if (!isOpen) return null;
    return (
      <>
        <Backdrop onClick={closeDropdown} />
        <ColorDropdown
          $placement={placement}
          className={className}
          style={{
            position: "fixed",
            top: "80px",
            right: "24px",
            zIndex: 10000,
          }}
        >
          <DropdownHeader>
            <ColorDropdownTitle style={{ margin: 0 }}>Primary Color</ColorDropdownTitle>
            <CloseButton onClick={closeDropdown} aria-label="Close theme selector">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </CloseButton>
          </DropdownHeader>
          <ColorGrid>
            {colors.map((color, idx) => (
              <ColorDot
                key={idx}
                $color={color}
                $active={currentPrimary === color}
                title={color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </ColorGrid>
          <ColorDropdownTitle style={{ paddingTop: "10px" }}>Dark Color</ColorDropdownTitle>
          <ColorGrid>
            {colors2.map((color, idx) => (
              <ColorDot
                key={idx}
                $color={color}
                $active={currentPrimary === color}
                title={color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </ColorGrid>
        </ColorDropdown>
      </>
    );
  }

  return (
    <ColorPickerWrapper ref={containerRef} className={className}>
      <ColorTriggerBtn
        onClick={toggleDropdown}
        title="Change primary color"
        $color={currentPrimary}
        type="button"
      >
        <BgColorsOutlined />
        {showLabel && <span>{label}</span>}
      </ColorTriggerBtn>

      {isOpen && (
        <ColorDropdown $placement={placement}>
          <ColorDropdownTitle>Primary Color</ColorDropdownTitle>
          <ColorGrid>
            {colors.map((color, idx) => (
              <ColorDot
                key={idx}
                $color={color}
                $active={currentPrimary === color}
                title={color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </ColorGrid>
          <ColorDropdownTitle style={{ paddingTop: "10px" }}>Dark Color</ColorDropdownTitle>
          <ColorGrid>
            {colors2.map((color, idx) => (
              <ColorDot
                key={idx}
                $color={color}
                $active={currentPrimary === color}
                title={color}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </ColorGrid>
        </ColorDropdown>
      )}
    </ColorPickerWrapper>
  );
};

export const ThemeChange = ThemeChanger;
export default ThemeChanger;

const ColorPickerWrapper = styled.div`
  position: relative;
`;

const ColorTriggerBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border, #e2e8f0);
  background: var(--color-bg, #f8fafc);
  color: ${({ $color }) => $color || "var(--color-text-secondary)"};
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $color }) => $color || "var(--color-primary)"};
    background: var(--color-surface, #fff);
  }

  .anticon {
    font-size: 15px;
  }
`;

const ColorDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  ${({ $placement }) => ($placement === "left" ? "left: 0;" : "right: 0;")}
  z-index: 1100;
  background: var(--color-surface, #ffffff);
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.15);
  width: 240px;
  max-width: calc(100vw - 32px);
  animation: dropIn 0.15s ease-out;

  @keyframes dropIn {
    from {
      opacity: 0;
      transform: translateY(-6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-border, #f3f4f6);
    color: var(--color-text-primary, #4b5563);
  }
`;

const ColorDropdownTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-secondary, #4b5563);
  margin-bottom: 10px;
  letter-spacing: 0.3px;
  text-transform: uppercase;
`;

const ColorGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ColorDot = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  cursor: pointer;
  border: 2px solid ${({ $active, $color }) => ($active ? $color : "transparent")};
  outline: ${({ $active }) => ($active ? "2px solid var(--color-surface, #fff)" : "none")};
  outline-offset: -3px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: scale(1.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: transparent;
`;
