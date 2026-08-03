import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button, Result, Typography } from "antd";

const { Paragraph, Text } = Typography;

const ErrorElement = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <Container>
      <Result
        status="error"
        title="Oops! Something went wrong"
        subTitle="An unexpected error has occurred in the application."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Back Home
          </Button>,
          <Button key="retry" onClick={() => window.location.reload()}>
            Retry
          </Button>,
        ]}
      >
        <div className="desc">
          <Paragraph>
            <Text strong style={{ fontSize: 16 }}>
              The following error was encountered:
            </Text>
          </Paragraph>
          <Paragraph>
            <Text type="danger">{error.statusText || error.message}</Text>
          </Paragraph>
        </div>
      </Result>
    </Container>
  );
};

export default ErrorElement;

const Container = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
  padding: 24px;
`;
