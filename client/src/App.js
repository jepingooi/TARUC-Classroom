import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
import VideoConferencing from "./modules/videoConferencing/home";
import VideoConferencingRoom from "./modules/videoConferencing/room";
import OnlineSurvey from "./modules/onlineSurvey/onlineSurvey";
import OnlineExam from "./modules/onlineExam/onlineExam";
import Login from "./modules/login/login";
import Header from "./components/header";
import Connection from "./modules/videoConferencing/connection";

// Firebase
import { firebaseConfig } from "./firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import { connect } from "socket.io-client";

initializeApp(firebaseConfig);
const db = getFirestore();

let rand = Math.floor(Math.random() * 4) + 1;
const loginUser = {
  email: `dummy${rand}@gmail.com`,
  name: `Dummy ${rand}`,
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
        this.setState({ selectedRoomId: secondParam, page: "videoConferencingRooms" });
      } else this.setState({ page: "videoConferencing" });
    } else this.setState({ page: "login" });
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
      // window.location.href = "/videoConferencing";
      this.props.history.push("/videoConferencing");
    }
  };

  handleNavigation = (tempPage, selectedRoomId) => {
    if (this.state.page !== tempPage) this.setState({ page: tempPage, selectedRoomId: selectedRoomId });
  };

  renderVideoConferencingHome = () => {
    return (
      <VideoConferencing
        handleNavigation={(page, room) => this.handleNavigation(page, room)}
        loginUser={this.state.loginUser}
        joinRoom={(selectedRoomId) => this.joinRoom(selectedRoomId)}
      />
    );
  };

  renderVideoConferencingRoom = () => {
    if (this.state.selectedRoomId) {
      return (
        <VideoConferencingRoom
          loginUser={this.state.loginUser}
          selectedRoomId={this.state.selectedRoomId}
          handleNavigation={(page) => this.handleNavigation(page, null)}
        />
      );
    }
  };

  renderOnlineSurvey = () => {
    return <OnlineSurvey />;
  };

  renderOnlineExam = () => {
    return <OnlineExam />;
  };

  renderErrorPage = () => {
    return <div>Error</div>;
  };

  renderLogin = () => {
    return <Login handleNavigation={() => this.handleNavigation("videoConferencing", null)} />;
  };

  renderConnection = () => {
    return <Connection loginUser={this.state.loginUser} selectedRoomId={this.state.selectedRoomId} />;
  };

  render = () => {
    return (
      <Router>
        {(this.state.page === "videoConferencing" ||
          this.state.page === "onlineSurvey" ||
          this.state.page === "onlineExam" ||
          this.state.page === "videoConferencingRoom" ||
          this.state.page === "connection") && (
          <Header
            page={this.state.page ? this.state.page : ""}
            handleNavigation={(page) => this.handleNavigation(page)}
            loginUser={this.state.loginUser}
          />
        )}

        <Switch>
          <Route exact path="/">
            {this.renderLogin()}
          </Route>
          <Route exact path={"/videoConferencing"}>
            {this.renderVideoConferencingHome()}
          </Route>
          <Route path={`/videoConferencing/:roomID`}>{this.renderVideoConferencingRoom()}</Route>
          <Route path={"/onlineSurvey"}>{this.renderOnlineSurvey()}</Route>
          <Route path={"/onlineExam"}>{this.renderOnlineExam()}</Route>
          <Route path={"/connection"}>{this.renderConnection()}</Route>
        </Switch>
      </Router>
    );
  };
}
