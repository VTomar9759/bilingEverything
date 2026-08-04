import styled from "styled-components";

export const CodeBadge = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(15,17,23,0.65);
  backdrop-filter: blur(6px);
  color: white;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

export const BrandTitle = styled.h1`
  font-family: var(--font-display, "Outfit", "Inter", sans-serif);
  font-weight: 800;
  font-size: ${({fontSize}) => fontSize|| "22px"};
  letter-spacing: -0.5px;
  color: var(--color-text-primary, #0f172a);
  margin: ${({margin}) => margin || "6px 0 2px 0"};
  line-height: 1.2;

  .highlight {
    background: linear-gradient(135deg, var(--color-primary, #01514B) 0%, #0d9488 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;