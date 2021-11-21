import React, { Suspense, useEffect, useState, useContext } from "react";
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter as Router,
} from "react-router-dom";

import VideoConferencing from "./modules/videoConferencing/home";

import Login from "./modules/login/pages/Login";
import Layout from "./layout/Layout";
import AuthContext from "./store/auth-context";

// Firebase
import { firebaseConfig } from "./firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";

const Survey = React.lazy(() => import("./modules/onlineSurvey/pages/Survey"));
const NewSurvey = React.lazy(() =>
  import("./modules/onlineSurvey/pages/NewSurvey")
);
const EditSurvey = React.lazy(() =>
  import("./modules/onlineSurvey/pages/PublishSurvey.js")
);
const PublishSurvey = React.lazy(() =>
  import("./modules/onlineSurvey/pages/PublishSurvey.js")
);
const SurveyDetails = React.lazy(() =>
  import("./modules/onlineSurvey/pages/SurveyDetails")
);
const VideoConferencingRoom = React.lazy(() =>
  import("./modules/videoConferencing/room")
);
const Exam = React.lazy(() => import("./modules/onlineExam/pages/Exam"));
const ExamDetails = React.lazy(() =>
  import("./modules/onlineExam/pages/ExamDetails")
);

initializeApp(firebaseConfig);
const db = getFirestore();

const rand = Math.floor(Math.random() * 4) + 1;
const user1 = {
  email: `ooijp-pm18@student.tarc.edu.my`,
  name: `Ooi Je Ping`,
};
const user2 = {
  email: `keesimee@tarc.edu.my`,
  name: `Kee Sim Ee`,
};
const user3 = {
  email: `william@tarc.edu.my`,
  name: `William`,
};
const user4 = {
  email: `ngwl-pm18@student.tarc.edu.my`,
  name: `Ng Wei Lun`,
};

const tempLoginUser =
  rand >= 3 ? (rand === 3 ? user3 : user4) : rand === 1 ? user1 : user2;

const App = (props) => {
  const authContext = useContext(AuthContext);
  const [page, setPage] = useState("videoConferencing");
  const [loginUser, setLoginUser] = useState(tempLoginUser);
  const [selectedRoomID, setSelectedRoomID] = useState(null);

  useEffect(() => {
    console.log(loginUser);
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
        if (eachParticipant.id === loginUser.email) match = true;
      });

      if (screenSharing) match = false;

      // If user didnt join the room before, update the participant in room data else skip
      if (!match) {
        let participantData = {
          id: screenSharing
            ? `shareScreen_${loginUser.email}`
            : loginUser.email,
          name: screenSharing ? `${loginUser.name}'s screen` : loginUser.name,
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
        loginUser={loginUser}
        joinRoom={(roomID) => joinRoom(roomID, false)}
      />
    );
  }

  function renderVideoConferencingRoom() {
    if (selectedRoomID)
      return (
        <VideoConferencingRoom
          loginUser={loginUser}
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
      <Route path={"/login"}>{renderVideoConferencingHome()}</Route>

      <Route exact path={`/videoConferencing`}>
        {renderVideoConferencingHome()}
      </Route>
      <Route path={`/videoConferencing/:roomID`}>
        {renderVideoConferencingRoom()}
      </Route>

      <Route path={"/surveys/new"}>
        <NewSurvey />
      </Route>
      <Route path={"/surveys/:id/edit"}>
        <EditSurvey />
      </Route>
      <Route path={"/surveys/:id/publish"}>
        <PublishSurvey />
      </Route>
      <Route path={"/surveys/:id"}>
        <SurveyDetails />
      </Route>
      <Route path={"/surveys"}>
        <Survey />
      </Route>

      <Route path={"/exams/new"}></Route>
      <Route path={"/exams/:id/edit"}></Route>
      <Route path={"/exams/:id"}>
        <ExamDetails />
      </Route>
      <Route path={"/exams"}>
        <Exam />
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
                <Login />
              </Route>
            </Switch>
          )}
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
