import React, { Component } from "react";
import { Route, Switch, BrowserRouter as Router } from "react-router-dom";
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

let rand = Math.floor(Math.random() * 2) + 1;
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
        this.setState({
          selectedRoomId: secondParam,
          page: "videoConferencingRooms",
        });
      } else this.setState({ page: "videoConferencing" });
    } else this.setState({ page: "login" });
  }

  // Join a room
  joinRoom = async (selectedRoomId, screenSharing) => {
    let roomRef = doc(db, "videoConferencingRooms", selectedRoomId);
    let roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.data()) {
      let match = false;

      // eslint-disable-next-line
      roomSnapshot.data().participantInRoomList.map((eachParticipant) => {
        if (eachParticipant.id === this.state.loginUser.email) match = true;
      });

      if (screenSharing) match = false;

      // If user didnt join the room before, update the participant in room data else skip
      if (!match) {
        let participantData = {
          id: screenSharing
            ? `shareScreen_${this.state.loginUser.email}`
            : this.state.loginUser.email,
          name: screenSharing
            ? `${this.state.loginUser.name}'s screen`
            : this.state.loginUser.name,
          mic: true,
          shareScreen: false,
          camera: false,
          raiseHand: false,
          type: screenSharing ? "screenSharing" : "default",
        };

        let tempParticipantInRoomList =
          roomSnapshot.data().participantInRoomList;
        tempParticipantInRoomList.push(participantData);
        await updateDoc(roomRef, {
          participantInRoomList: tempParticipantInRoomList,
        });
      }

      this.handleNavigation("videoConferencingRoom", selectedRoomId);
    } else {
      this.handleNavigation("videoConferencing");
      this.props.history.push("/videoConferencing");
    }
  };

  handleNavigation = (tempPage, selectedRoomId) => {
    if (this.state.page !== tempPage)
      this.setState({ page: tempPage, selectedRoomId: selectedRoomId });
  };

  renderVideoConferencingHome = () => {
    return (
      <VideoConferencing
        handleNavigation={(page, room) => this.handleNavigation(page, room)}
        loginUser={this.state.loginUser}
        joinRoom={(selectedRoomId) => this.joinRoom(selectedRoomId, false)}
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
          joinRoom={(selectedRoomId, screenSharing) =>
            this.joinRoom(selectedRoomId, screenSharing)
          }
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
    return (
      <Login
        handleNavigation={() =>
          this.handleNavigation("videoConferencing", null)
        }
      />
    );
  };

  render = () => {
    return (
      <Router>
        {(this.state.page === "videoConferencing" ||
          this.state.page === "videoConferencingRoom" ||
          this.state.page === "onlineSurvey" ||
          this.state.page === "onlineExam") && (
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
          <Route path={`/videoConferencing/:roomID`}>
            {this.renderVideoConferencingRoom()}
          </Route>
          <Route path={"/onlineSurvey"}>{this.renderOnlineSurvey()}</Route>
          <Route path={"/onlineSurvey/new"}>{this.renderOnlineSurvey()}</Route>
          <Route path={"/onlineSurvey/:id"}>{this.renderOnlineSurvey()}</Route>
          <Route path={"/onlineSurvey/:id/edit"}>
            {this.renderOnlineSurvey()}
          </Route>
          <Route path={"/onlineExam"}>{this.renderOnlineExam()}</Route>
          <Route path={"/onlineExam/new"}>{this.renderOnlineExam()}</Route>
          <Route path={"/onlineExam/:id"}>{this.renderOnlineExam()}</Route>
          <Route path={"/onlineExamy/:id/edit"}>
            {this.renderOnlineExam()}
          </Route>
        </Switch>
      </Router>
    );
  };
}
