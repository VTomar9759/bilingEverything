import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
`;

const Spinner = styled.div`
  border: 4px solid #e0e0e0;
  border-top: 4px solid ${({ theme }) => theme.color.primary}; 
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 12px;
  font-size: 16px;
  font-weight: 500;
  color: #444;
  font-family: 'Inter', sans-serif;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Loading = () => (
  <LoaderContainer>
    <Column>
      <Spinner />
      <LoadingText>Loading...</LoadingText>
    </Column>
  </LoaderContainer>
);

export default Loading;
