import React, { Component } from "react";
import styled from "styled-components";

export default class onlineExam extends Component {
  render = () => {
    return <StyledContent>Online Exam</StyledContent>;
  };
}

const StyledContent = styled.div`
  display: flex;
  width: calc(100vw - 140px);
  height: calc(100vh - 70px);
`;
