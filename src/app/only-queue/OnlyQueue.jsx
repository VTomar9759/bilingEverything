import styled from "styled-components";
import Queue from "../pages/order-queue/Queue";
import PageSEO from "../../components/SEO/PageSEO";

const OnlyQueue = () => {
  return (
    <OnlyQueueWrapper>
      <PageSEO />
      <Queue hideCustomerNav={true} showExitNav={true} />
    </OnlyQueueWrapper>
  );
};

export default OnlyQueue;

const OnlyQueueWrapper = styled.div`
  padding: 16px 20px;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 720px) {
    padding: 12px 14px;
  }
`;