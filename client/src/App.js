import React, { Suspense, useEffect, useState, useContext } from "react";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
} from "react-router-dom";

import VideoConferencing from "./modules/videoConferencing/home";

import User from "./modules/user/pages/User";
import Layout from "./layout/Layout";
import AuthContext from "./store/auth-context";
// Firebase
import { firebaseConfig } from "./firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import Breadcrumbs from "./components/Breadcrumbs";

const Survey = React.lazy(() => import("./modules/onlineSurvey/pages/Survey"));
const NewSurvey = React.lazy(() =>
  import("./modules/onlineSurvey/pages/NewSurvey")
);
const AnswerSurvey = React.lazy(() =>
  import("./modules/onlineSurvey/pages/AnswerSurvey.js")
);
const PublishSurvey = React.lazy(() =>
  import("./modules/onlineSurvey/pages/PublishSurvey.js")
);
const SurveyResponse = React.lazy(() =>
  import("./modules/onlineSurvey/pages/SurveyResponse")
);
const VideoConferencingRoom = React.lazy(() =>
  import("./modules/videoConferencing/room")
);

initializeApp(firebaseConfig);
const db = getFirestore();

const App = (props) => {
  const authContext = useContext(AuthContext);
  const { user, surveyId } = authContext;
  const [page, setPage] = useState("videoConferencing");
  const [selectedRoomID, setSelectedRoomID] = useState(null);

  useEffect(() => {
    let pathName = window.location.pathname.trim();
    let firstParam = pathName.split("/")[1];
    if (firstParam === "videoConferencing") {
      let secondParam = pathName.split("/")[2];
      if (secondParam) {
        joinRoom(secondParam);
        setSelectedRoomID(secondParam);
        setPage("videoConferencingRooms");
      } else setPage("videoConferencing");
    } else setPage("login");
  }, []);

  async function joinRoom(roomID, screenSharing) {
    let roomRef = doc(db, "videoConferencingRooms", roomID);
    let roomSnapshot = await getDoc(roomRef);

    if (roomSnapshot.data()) {
      let match = false;

      // eslint-disable-next-line
      roomSnapshot.data().participantInRoomList.map((eachParticipant) => {
        if (eachParticipant.id === authContext.user.email) match = true;
      });

      if (screenSharing) match = false;

      // If user didnt join the room before, update the participant in room data else skip
      if (!match) {
        let participantData = {
          id: screenSharing
            ? `shareScreen_${authContext.user.email}`
            : authContext.user.email,
          name: screenSharing
            ? `${authContext.user.name}'s screen`
            : authContext.user.name,
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

      handleNavigation("videoConferencingRoom", roomID);
    } else {
      handleNavigation("videoConferencing");
      props.history.push("/videoConferencing");
    }
  }

  function handleNavigation(newPage, roomID) {
    if (page !== newPage) {
      setPage(newPage);
      setSelectedRoomID(roomID);
    }
  }

  function renderVideoConferencingHome() {
    return (
      <VideoConferencing
        loginUser={authContext.user}
        joinRoom={(roomID) => joinRoom(roomID, false)}
      />
    );
  }

  function renderVideoConferencingRoom() {
    if (selectedRoomID)
      return (
        <VideoConferencingRoom
          loginUser={authContext.user}
          selectedRoomId={selectedRoomID}
          handleNavigation={(page) => handleNavigation(page, null)}
          joinRoom={(roomID, screenSharing) => joinRoom(roomID, screenSharing)}
        />
      );
  }

  const loggedInRoutes = (
    <Switch>
      <Route exact path="/">
        <Redirect to="/videoConferencing" />
      </Route>

      <Route exact path={`/videoConferencing`}>
        {renderVideoConferencingHome()}
      </Route>
      <Route path={`/videoConferencing/:roomID`}>
        {renderVideoConferencingRoom()}
      </Route>

      <Route path={"/surveys/new"}>
        <NewSurvey />
      </Route>
      <Route path={"/surveys/:id/answer"}>
        <AnswerSurvey />
      </Route>
      <Route path={"/surveys/:id/edit"}>
        {!user.isStudent && <Breadcrumbs id={surveyId} active="edit" />}
        <NewSurvey />
      </Route>
      <Route path={"/surveys/:id/publish"}>
        <PublishSurvey />
      </Route>
      <Route path={"/surveys/:id/response"}>
        <Breadcrumbs active="response" />
        <SurveyResponse />
      </Route>
      <Route path={"/surveys/:id"}>
        {!user.isStudent && <Breadcrumbs id={surveyId} active="preview" />}
        <AnswerSurvey />
      </Route>
      <Route path={"/surveys"}>
        <Survey />
      </Route>
      <Route path={"*"}>
        <p>THIS SHOULD BE REPLACED WITH 404 PAGE</p>
      </Route>
    </Switch>
  );

  return (
    <Router>
      <Layout>
        <Suspense fallback={<p>Loading...</p>}>
          {authContext.isLoggedIn && loggedInRoutes}
          {!authContext.isLoggedIn && (
            <Switch>
              <Route path={"*"}>
                <User />
              </Route>
            </Switch>
          )}
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
