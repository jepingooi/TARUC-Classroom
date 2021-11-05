import React, { Component } from "react";
import styled from "styled-components";

export default class onlineSurvey extends Component {
  render = () => {
    return <StyledContent>Online Survey</StyledContent>;
  };
}

const StyledContent = styled.div`
  display: flex;
  width: calc(100vw - 140px);
  height: calc(100vh - 70px);
`;
