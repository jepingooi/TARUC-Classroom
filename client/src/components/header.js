import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import TarucLogo from "../resources/TARUCLogo.png";
import { Dropdown, Button } from "semantic-ui-react";

export default class Header extends Component {
  constructor(props) {
    super(props);
    this.state = { userDropdown: false };
  }

  generateUserOption = () => {
    let logOutOption = (
      <StyledDropdownItem
        key="sign-out"
        text="Sign Out"
        icon="sign out"
        onClick={() => {
          this.props.handleNavigation("login");
        }}
      />
    );

    return logOutOption;
  };

  renderLogo = () => {
    return (
      <StyledLogo>
        <StyledLogoImg src={TarucLogo} alt="Taruc Logo" />
        <StyledLogoText>TARUC Classroom</StyledLogoText>
      </StyledLogo>
    );
  };

  renderNavigation = () => {
    return (
      <StyledNavigationContainer>
        <Link to={"/videoConferencing"}>
          <StyledNavitgationItem
            onClick={() => this.props.handleNavigation("videoConferencing")}
            style={
              this.props.page === "videoConferencing" ||
              this.props.page === "videoConferencingRoom"
                ? { color: "#FAFF04" }
                : { color: "#ffffff" }
            }
          >
            Video Conferencing
          </StyledNavitgationItem>
        </Link>

        <Link to={"/onlineSurvey"}>
          <StyledNavitgationItem
            onClick={() => this.props.handleNavigation("onlineSurvey")}
            style={
              this.props.page === "onlineSurvey"
                ? { color: "#FAFF04" }
                : { color: "#ffffff" }
            }
          >
            Survey
          </StyledNavitgationItem>
        </Link>

        <Link to={"/onlineExam"}>
          <StyledNavitgationItem
            onClick={() => this.props.handleNavigation("onlineExam")}
            style={
              this.props.page === "onlineExam"
                ? { color: "#FAFF04" }
                : { color: "#ffffff" }
            }
          >
            Exam
          </StyledNavitgationItem>
        </Link>
      </StyledNavigationContainer>
    );
  };

  renderUser = () => {
    return (
      <StyledUserContainer>
        <Button
          onClick={() =>
            this.setState({ userDropdown: !this.state.userDropdown })
          }
          icon="user"
          size="medium"
        />
        <Dropdown
          open={this.state.userDropdown}
          pointing="top right"
          icon={null}
        >
          <Dropdown.Menu>
            <Link to={"/"}>{this.generateUserOption()}</Link>
          </Dropdown.Menu>
        </Dropdown>
      </StyledUserContainer>
    );
  };

  render = () => {
    return (
      <StyledHeaderContainer>
        {this.renderLogo()}
        {this.renderNavigation()}
        <div style={{ flex: 1 }} />
        {this.renderUser()}
      </StyledHeaderContainer>
    );
  };
}

const StyledHeaderContainer = styled.div`
  background-color: #438eb9;
  width: 100vw;
  display: flex;
  align-items: center;
`;

const StyledLogo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledLogoImg = styled.img`
  width: auto;
  height: 50px;
  margin-left: 100px;
`;

const StyledLogoText = styled.div`
  font-size: 20px;
  margin-left: 10px;
  color: #ffffff;
  font-weight: 600;
`;

const StyledNavigationContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-left: 40px;
`;

const StyledNavitgationItem = styled.div`
  margin-left: 30px;
  :hover {
    cursor: pointer;
  }
`;

const StyledUserContainer = styled.div`
  margin-right: 100px;
`;

const StyledDropdownItem = styled(Dropdown.Item)`
  color: #000000;
  margin: 5px;
`;
