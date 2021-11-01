import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import styled from "styled-components";
import VideoConferencing from "./modules/videoConferencing/home";
import VideoConferencingRoom from "./modules/videoConferencing/room";
import OnlineSurvey from "./modules/onlineSurvey/onlineSurvey";
import OnlineExam from "./modules/onlineExam/onlineExam";
import Login from "./modules/login/login";
import Header from "./components/header";

// Firebase
import { firebaseConfig } from "./firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();
let rand = Math.floor(Math.random() * 5) + 1;
const loginUser = {
  email: `dummy${rand}@gmail.com`,
  name: `Dummy ${rand}`,
  ownedRoomList: [],
  participatedRoomList: [],
};

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "videoConferencing",
      loginUser: loginUser,
    };
  }

  componentDidMount() {
    let pathName = window.location.pathname.trim();
    let firstParam = pathName.split("/")[1];

    if (firstParam === "videoConferencing") {
      let secondParam = pathName.split("/")[2];
      if (secondParam) {
        this.joinRoom(secondParam);
        this.setState({ selectedRoomId: secondParam });
      }
    }
  }

  // Join a room
  joinRoom = async (selectedRoomId) => {
    let roomRef = doc(db, "videoConferencingRooms", selectedRoomId);
    let roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.data()) {
      let match = false;

      // eslint-disable-next-line
      roomSnapshot.data().participantInRoomList.map((eachParticipant) => {
        if (eachParticipant.id === this.state.loginUser.email) match = true;
      });

      // If user didnt join the room before, update the participant in room data else skip
      if (!match) {
        let participantData = {
          id: this.state.loginUser.email,
          name: this.state.loginUser.name,
          mic: false,
          shareScreen: false,
          camera: false,
          raiseHand: false,
        };

        let tempParticipantInRoomList = roomSnapshot.data().participantInRoomList;
        tempParticipantInRoomList.push(participantData);
        await updateDoc(roomRef, {
          participantInRoomList: tempParticipantInRoomList,
        });
      }

      this.handleNavigation("videoConferencingRoom", selectedRoomId);
    } else {
      this.handleNavigation("videoConferencing");
      window.location.href = "/videoConferencing";
    }
  };

  handleNavigation = (tempPage, selectedRoomId) => {
    if (this.state.page !== tempPage) this.setState({ page: tempPage, selectedRoomId: selectedRoomId });
  };

  renderVideoConferencingHome = () => {
    return (
      <div>
        {this.renderHeader()}
        <StyledContent>
          <VideoConferencing
            handleNavigation={(page, room) => this.handleNavigation(page, room)}
            loginUser={this.state.loginUser}
            joinRoom={(selectedRoomId) => this.joinRoom(selectedRoomId)}
          />
        </StyledContent>
      </div>
    );
  };

  renderVideoConferencingRoom = () => {
    if (this.state.selectedRoomId) {
      return (
        <div>
          {this.renderHeader()}
          <StyledContent>
            <VideoConferencingRoom
              loginUser={this.state.loginUser}
              selectedRoomId={this.state.selectedRoomId}
              handleNavigation={(page) => this.handleNavigation(page, null)}
            />
          </StyledContent>
        </div>
      );
    }
  };

  renderOnlineSurvey = () => {
    return (
      <div>
        {this.renderHeader()}
        <StyledContent>
          <OnlineSurvey />
        </StyledContent>
      </div>
    );
  };

  renderOnlineExam = () => {
    return (
      <div>
        {this.renderHeader()}
        <StyledContent>
          <OnlineExam />
        </StyledContent>
      </div>
    );
  };

  renderErrorPage = () => {
    return <div>Error</div>;
  };

  renderHeader = () => {
    return (
      <StyledHeader>
        <Header
          page={this.state.page ? this.state.page : ""}
          handleNavigation={(page) => this.handleNavigation(page)}
          loginUser={this.state.loginUser}
        />
      </StyledHeader>
    );
  };

  renderLogin = () => {
    return (
      <StyledLogin>
        <Login />
      </StyledLogin>
    );
  };

  render = () => {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            {this.renderLogin()}
          </Route>
          <Route exact path={"/videoConferencing"}>
            {this.renderVideoConferencingHome()}
          </Route>
          <Route path={`/videoConferencing/${this.state.selectedRoomId}`}>{this.renderVideoConferencingRoom()}</Route>
          <Route path={"/onlineSurvey"}>{this.renderOnlineSurvey()}</Route>
          <Route path={"/onlineExam"}>{this.renderOnlineExam()}</Route>
        </Switch>
      </Router>
    );
  };
}

const StyledHeader = styled.div`
  display: flex;
  width: 100vw;
  height: 70px;
`;

const StyledContent = styled.div`
  display: flex;
  width: calc(100vw - 140px);
  height: calc(100vh - 70px);
`;

const StyledLogin = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`;
