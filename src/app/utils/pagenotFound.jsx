import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f7f9fc;
  text-align: center;
  padding: 20px;
`;

const ErrorCode = styled.h1`
  font-size: 8rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
`;

const Message = styled.p`
  font-size: 1.5rem;
  color: #c90808;
  margin: 20px 0;
`;

const HomeLink = styled(Link)`
  padding: 12px 24px;
  background-color: #3182ce;
  color: white;
  font-size: 1rem;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s ease;

  &:hover {
    background-color: #2b6cb0;
  }
`;

const PageNotFound = () => {
  return (
    <Wrapper>
      <ErrorCode>404</ErrorCode>
      <Message>Oops! The page you are looking for does not exist.</Message>
      <HomeLink to="/">Return </HomeLink>
    </Wrapper>
  );
};

export default PageNotFound;
