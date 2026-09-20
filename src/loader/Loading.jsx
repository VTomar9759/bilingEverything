import styled, { keyframes } from "styled-components";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const pulseProgress = keyframes`
  0%   { width: 0%;   left: 0;   opacity: 1; }
  60%  { width: 70%;  left: 10%; opacity: 1; }
  100% { width: 100%; left: 0;   opacity: 0.6; }
`;

/* Top progress line that shows during Suspense fallback */
const TopLine = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  z-index: 99999;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    height: 100%;
    background: linear-gradient(90deg, #01514b 0%, #00a389 60%, #4ade80 100%);
    box-shadow: 0 0 10px #00a389;
    animation: ${pulseProgress} 1.1s ease-in-out infinite;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: flex;
  height:80vh;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #ffffff);
  z-index: 9998;
`;

const Ring = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(1, 81, 75, 0.15);
  border-top-color: #01514b;
  animation: ${spin} 0.75s linear infinite;
`;

const Loading = () => (
  <>
    <TopLine />
    <Overlay>
        <Ring />
      
    </Overlay>
  </>
);

export default Loading;
