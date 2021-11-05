import React, { Component, createRef } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Button, Modal, Icon } from "semantic-ui-react";
// Modals
import SettingModal from "./settingModal";
import PollModal from "./pollModal";
import MainScreen from "./mainScreen";
import ChatBox from "./chatBox";
import ScreenRecordingModal from "./screenRecordingModal";
import Room from "./connection";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDoc, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

let unsubRoom;
let unsubChatHistory;
let unsubAttendance;

class VideoConferencingRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginUser: props.loginUser,
      recording: false,
      attendanceMarked: false,
      toggleMicButton: "",
      toggleVideoButton: "",

      // Modal
      hangUpModal: false,
      shareScreenModal: false,
      cameraModal: false,
      micModal: false,
      recordingModal: false,
      settingModal: false,

      // Video conferencing
      peers: [],
      videoFlag: true,
      audioFlag: false,
      userUpdate: [],
    };
    this.socketRef = createRef();
    this.userVideoRef = createRef();
    this.peersRef = createRef();
    this.peersRef.current = [];
  }

  onUnload = (e) => {
    e.preventDefault();
    this.componentWillUnmount();
  };

  async componentWillUnmount() {
    // this.handleAttendance("leave");

    this.handleHangUp();

    if (unsubRoom) await unsubRoom();
    if (unsubChatHistory) await unsubChatHistory();
    if (unsubAttendance) await unsubAttendance();

    window.removeEventListener("beforeunload", this.onUnload);
  }

  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload);
    this.getUserFromFirebases();

    let roomRef = doc(db, "videoConferencingRooms", this.props.selectedRoomId);
    unsubRoom = onSnapshot(roomRef, () => {
      this.getSelectedRoomFromFirebase();
    });

    let chatHistoryRef = doc(db, "chatHistory", this.props.selectedRoomId);
    unsubChatHistory = onSnapshot(chatHistoryRef, () => {
      this.getChatHistoryFromFirebases();
    });

    // let attendanceRef = doc(db, "attendance", this.props.selectedRoomId);
    // unsubAttendance = onSnapshot(attendanceRef, () => {
    //   this.getAttendanceFromFirebase();
    // });
  }

  componentDidUpdate() {
    if (this.state.loginUser !== this.props.loginUser || !this.state.loginUser) {
      this.setState({ loginUser: this.props.loginUser });
    }
  }

  // Get selected room from firebase
  getSelectedRoomFromFirebase = async () => {
    let roomRef = doc(db, "videoConferencingRooms", this.props.selectedRoomId);
    let roomSnapshot = await getDoc(roomRef);
    let selectedRoom = roomSnapshot.data();

    if (selectedRoom) {
      selectedRoom.startTime = new Date(selectedRoom.startTime.seconds * 1000);
      selectedRoom.endTime = new Date(selectedRoom.endTime.seconds * 1000);

      this.setState({ selectedRoom: selectedRoom });
    }
  };

  // Get all users from firebase
  getUserFromFirebases = async () => {
    let tempUserList = [];
    let userRef = collection(db, "users");
    let userQuerySnapshot = await getDocs(userRef);
    userQuerySnapshot.forEach((doc) => {
      tempUserList.push(doc.data());
    });

    this.setState({ userList: tempUserList });
  };

  // Get chat history from firebase
  getChatHistoryFromFirebases = async () => {
    let chatHistoryRef = doc(db, "chatHistory", this.props.selectedRoomId);
    let chatHistorySnapshot = await getDoc(chatHistoryRef);
    let tempChatMessageList = [];

    // eslint-disable-next-line
    chatHistorySnapshot.data().messageList.map((eachMessage) => {
      let tempMessage = {
        id: eachMessage.id,
        message: eachMessage.message,
        sender: eachMessage.sender,
        time: new Date(eachMessage.time.seconds * 1000),
      };
      tempChatMessageList.push(tempMessage);
    });

    this.setState({ chatMessageList: tempChatMessageList });
  };

  // Get attendance from firebase
  getAttendanceFromFirebase = async () => {
    let attendaceRef = doc(db, "attendance", this.props.selectedRoomId);
    let attendanceSnapshot = await getDoc(attendaceRef);
    let attendance = attendanceSnapshot.data();

    if (attendance) {
      if (attendance.attendanceList.length > 0) {
        // eslint-disable-next-line
        attendance.attendanceList.map((eachAttendance) => {
          eachAttendance.time = new Date(eachAttendance.time.seconds * 1000);
        });
      }
      this.setState({ attendance: attendance }, () => this.handleAttendance("join"));
    }
  };

  handleAttendance = async (type) => {
    let now = new Date();
    if (!this.state.attendanceMarked && type === "join") {
      this.setState({ attendanceMarked: true, joinTime: now });
      if (!this.state.attendance.attendeeIdList.includes(this.state.loginUser.email)) {
        let tempAttendeeIdList = this.state.attendance.attendeeIdList;
        tempAttendeeIdList.push(this.state.loginUser.email);
      }

      let tempAttendanceList = this.state.attendance.attendanceList;
      let startTime = this.state.selectedRoom.startTime;
      let tempStartTime = new Date(
        startTime.getFullYear(),
        startTime.getMonth(),
        startTime.getDate(),
        startTime.getHours(),
        startTime.getMinutes()
      );
      tempStartTime.setMinutes(tempStartTime.getMinutes() + 15);

      // Marked as late if user join 15 minutes after start time
      let attendance = {
        attendeeName: this.state.loginUser.name,
        attendeeId: this.state.loginUser.email,
        time: now,
        action: "Join",
        notes: now < tempStartTime ? "-" : "Late",
      };

      tempAttendanceList.push(attendance);

      let attendaceRef = doc(db, "attendance", this.props.selectedRoomId);
      await updateDoc(attendaceRef, {
        attendeeIdList: this.state.attendance.attendeeIdList,
        attendanceList: tempAttendanceList,
      });
    } else if (this.state.attendanceMarked && type === "leave") {
      let joinDuration = now - this.state.joinTime;
      let tempAttendanceList = this.state.attendance.attendanceList;
      let attendance = {
        attendeeName: this.state.loginUser.name,
        attendeeId: this.state.loginUser.email,
        time: now,
        action: "Leave",
        notes: `Join duration: ${this.msToTime(joinDuration)}`,
      };

      tempAttendanceList.push(attendance);
      let attendaceRef = doc(db, "attendance", this.props.selectedRoomId);
      await updateDoc(attendaceRef, {
        attendanceList: tempAttendanceList,
      });
    }
  };

  msToTime = (duration) => {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + " Hour(s) " + minutes + " Minute(s) " + seconds + " Second(s)";
  };

  // Raise hand
  handleRaiseHand = async () => {
    let onlineUserList = Object.assign([], this.state.selectedRoom.participantInRoomList);

    // eslint-disable-next-line
    onlineUserList.map((eachUser) => {
      if (eachUser.id === this.state.loginUser.email) {
        eachUser.raiseHand = !eachUser.raiseHand;
      }
    });

    let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: onlineUserList });
  };

  // Recording
  handleRecording = (status) => {
    this.setState({ recording: status });
  };

  // Camera
  handleCamera = () => {
    if (this.userVideoRef.current.srcObject) {
      this.userVideoRef.srcObject.getTracks().forEach(function (track) {
        if (track.kind === "video") {
          let bool = track.enabled;
          this.socketRef.current.emit("change", [
            this.state.userUpdate,
            {
              id: this.socketRef.current.id,
              videoFlag: !bool,
              audioFlag: this.state.audioFlag,
            },
          ]);
          track.enabled = !bool;
          this.setState({ videoFlag: !bool });
        }
      });
    }
  };

  // Mic
  handleMic = () => {
    if (this.userVideoRef.current.srcObject) {
      this.userVideoRef.srcObject.getTracks().forEach(function (track) {
        if (track.kind === "audio") {
          let bool = track.enabled;
          this.socketRef.current.emit("change", [
            this.state.userUpdate,
            {
              id: this.socketRef.current.id,
              videoFlag: this.state.videoFlag,
              audioFlag: !bool,
            },
          ]);
          track.enabled = !bool;
          this.setState({ audioFlag: !bool });
        }
      });
    }
  };

  // Hang up function
  handleHangUp = async () => {
    if (!this.state.selectedRoom) return;

    let tempParticipantInRoomList = [];
    let participantInRoomList = this.state.selectedRoom.participantInRoomList;

    // eslint-disable-next-line
    participantInRoomList.map((eachParticipant) => {
      if (eachParticipant.id !== this.state.loginUser.email) tempParticipantInRoomList.push(eachParticipant);
    });

    let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: tempParticipantInRoomList });

    this.handleModal("hangUpModal", false);
    this.props.handleNavigation("videoConferencing", null);
    this.props.history.push(`/videoConferencing`);
  };

  // Handle open or close modal
  handleModal = (type, status, action) => {
    let tempAction = action;

    // Poll action
    if (
      this.state.loginUser &&
      this.state.loginUser.email === this.state.selectedRoom.ownerId &&
      type === "pollModal" &&
      status === true
    ) {
      tempAction = "create";
    } else if (type === "pollModal" && status === true) tempAction = "answer";

    this.setState({ [type]: status, action: tempAction });
  };

  // Generate participants on the left (login user will be shown first)
  renderParticipants = () => {
    let onlineUserList = Object.assign([], this.state.selectedRoom.participantInRoomList);
    let sharingScreenIcon = <Icon name="laptop" size="large" style={{ marginRight: "10px" }} />;
    let cameraOnIcon = <Icon name="video camera" size="large" style={{ marginRight: "10px" }} />;
    let microphoneMutedIcon = <Icon name="microphone slash" size="large" style={{ marginRight: "10px" }} />;
    let raiseHandIcon = <Icon name="hand paper" size="large" style={{ marginRight: "10px" }} />;

    let onlineUser = [];
    let otherUser = [];

    // eslint-disable-next-line
    onlineUserList.map((eachUser) => {
      if (eachUser.id !== this.state.loginUser.email) {
        otherUser.push(
          <ParticipantContainer key={`loginUser${eachUser.id}`}>
            <ParticipantNameContainer>{eachUser.name}</ParticipantNameContainer>
            <StatusContainer>
              {eachUser.shareScreen && sharingScreenIcon}
              {eachUser.camera && cameraOnIcon}
              {!eachUser.mic && microphoneMutedIcon}
              {eachUser.raiseHand && raiseHandIcon}
            </StatusContainer>
          </ParticipantContainer>
        );
      } else {
        onlineUser.push(
          <ParticipantContainer key={`otherUser${eachUser.id}`}>
            <ParticipantNameContainer>{eachUser.name}</ParticipantNameContainer>
            <StatusContainer>
              {eachUser.shareScreen && sharingScreenIcon}
              {eachUser.camera && cameraOnIcon}
              {!eachUser.mic && microphoneMutedIcon}
              {eachUser.raiseHand && raiseHandIcon}
            </StatusContainer>
          </ParticipantContainer>
        );
      }
    });

    onlineUser = onlineUser.concat(otherUser);

    return onlineUser;
  };

  // All function buttons
  renderFunctionsButton = () => {
    let tempUser = {};
    // eslint-disable-next-line
    this.state.selectedRoom.participantInRoomList.map((eachParticipant) => {
      if (eachParticipant.id === this.state.loginUser.email) {
        tempUser = eachParticipant;

        if (eachParticipant.id === this.state.selectedRoom.ownerId) tempUser.owner = true;
        else tempUser.owner = false;
      }
    });

    return (
      <div style={{ margin: "30px" }}>
        <Button.Group floated="right">
          {tempUser.owner && (
            <Button
              onClick={() => this.handleModal("settingModal", true, "edit")}
              icon="setting"
              size="massive"
              circular
              color={"grey"}
            />
          )}

          {(this.state.selectedRoom?.pollIdList.length > 0 || tempUser.owner) && (
            <Button
              onClick={() => this.handleModal("pollModal", true)}
              icon="list ul"
              size="massive"
              circular
              color={"grey"}
            />
          )}

          {tempUser.owner && (
            <Button
              onClick={() => this.handleModal("recordingModal", true)}
              icon="film"
              size="massive"
              circular
              color={this.state.recording ? "green" : "grey"}
            />
          )}

          {this.state.selectedRoom?.raiseHand && (
            <Button
              onClick={() => this.handleRaiseHand()}
              icon="hand paper"
              size="massive"
              circular
              color={tempUser.raiseHand ? "green" : "grey"}
            />
          )}

          {(this.state.selectedRoom?.mic || tempUser.owner) && this.state.toggleMicButton}

          {(this.state.selectedRoom?.camera || tempUser.owner) && this.state.toggleVideoButton}

          {(this.state.selectedRoom?.shareScreen || tempUser.owner) && (
            <Button
              onClick={() => this.handleModal("shareScreenModal", true)}
              icon={"laptop"}
              size="massive"
              circular
              color={tempUser.shareScreen ? "green" : "grey"}
            />
          )}

          <Button
            onClick={() => this.handleModal("hangUpModal", true)}
            icon="shutdown"
            size="massive"
            circular
            color={"grey"}
          />
        </Button.Group>
      </div>
    );
  };

  // Setting modal
  renderRoomSettingModal = () => {
    return (
      <SettingModal
        handleModal={(status) => this.handleModal("settingModal", status)}
        action={this.state.action}
        settingModal={this.state.settingModal}
        selectedRoom={this.state.selectedRoom}
        loginUser={this.state.loginUser}
        userList={this.state.userList}
      />
    );
  };

  // Poll modal
  renderPollModal = () => {
    return (
      <PollModal
        handleModal={(status) => this.handleModal("pollModal", status)}
        loginUser={this.state.loginUser}
        selectedRoom={this.state.selectedRoom}
        pollModal={this.state.pollModal}
        action={this.state.action}
      />
    );
  };

  // Recording modal
  renderRecordingModal = () => {
    return (
      <ScreenRecordingModal
        handleModal={(status) => this.handleModal("recordingModal", status)}
        handleRecording={(status) => this.handleRecording(status)}
        recordingModal={this.state.recordingModal}
        selectedRoom={this.state.selectedRoom}
        loginUser={this.state.loginUser}
      />
    );
  };

  // Toggle camera modal
  renderCameraModal = () => {
    return (
      <Modal
        closeIcon
        open={this.state.cameraModal}
        size={"tiny"}
        onClose={() => this.handleModal("cameraModal", false)}
      >
        <Modal.Header>Turn {this.state.videoFlag ? "off" : "on"} camera?</Modal.Header>
        <Modal.Actions>
          <Button negative onClick={() => this.handleModal("cameraModal", false)}>
            Cancel
          </Button>
          <Button positive onClick={() => this.handleCamera()}>
            Confirm
          </Button>
        </Modal.Actions>
      </Modal>
    );
  };

  // Toggle camera modal
  renderMicModal = () => {
    return (
      <Modal closeIcon open={this.state.micModal} size={"tiny"} onClose={() => this.handleModal("micModal", false)}>
        <Modal.Header>Turn {this.state.audioFlag ? "off" : "on"} mic?</Modal.Header>
        <Modal.Actions>
          <Button negative onClick={() => this.handleModal("micModal", false)}>
            Cancel
          </Button>
          <Button positive onClick={() => this.handleMic()}>
            Confirm
          </Button>
        </Modal.Actions>
      </Modal>
    );
  };

  // Hang up modal
  renderHangUpModal = () => {
    return (
      <Modal
        closeIcon
        open={this.state.hangUpModal}
        size={"tiny"}
        onClose={() => this.handleModal("hangUpModal", false)}
      >
        <Modal.Header>Hang up from this call?</Modal.Header>
        <Modal.Actions>
          <Button negative onClick={() => this.handleModal("hangUpModal", false)}>
            Cancel
          </Button>
          <Button positive onClick={() => this.handleHangUp()}>
            Confirm
          </Button>
        </Modal.Actions>
      </Modal>
    );
  };

  // Big main screen
  renderMainScreen = () => {
    return <MainScreen selectedRoom={this.state.selectedRoom} loginUser={this.state.loginUser} />;
  };

  renderChatBox = () => {
    return (
      <ChatBox
        chatMessageList={this.state.chatMessageList}
        loginUser={this.state.loginUser}
        selectedRoom={this.state.selectedRoom}
      />
    );
  };

  renderRoom = () => {
    return (
      <Room
        setButton={(type, data) => this.setState({ [type]: data })}
        selectedRoom={this.state.selectedRoom}
        loginUser={this.state.loginUser}
      />
    );
  };

  render = () => {
    if (this.state.selectedRoom && this.state.userList && this.state.loginUser) {
      return (
        <StyledContent>
          {this.state.loginUser &&
            this.state.loginUser.email === this.state.selectedRoom.ownerId &&
            this.renderRoomSettingModal()}

          {(this.state.selectedRoom.pollIdList.length > 0 ||
            (this.state.loginUser && this.state.loginUser.email === this.state.selectedRoom.ownerId)) &&
            this.renderPollModal()}

          {this.renderRecordingModal()}
          {this.renderCameraModal()}
          {this.renderMicModal()}
          {this.renderHangUpModal()}
          <div>
            <ParticipantListContainer>{this.renderParticipants()}</ParticipantListContainer>
            {this.renderChatBox()}
          </div>
          <div style={{ backgroundColor: "black" }}>
            {this.renderRoom()}
            {/* <MainScreenContainer>{this.renderMainScreen()}</MainScreenContainer> */}
            <div style={{ backgroundColor: "blue", width: "100%" }}>{this.renderFunctionsButton()}</div>
          </div>
        </StyledContent>
      );
    } else {
      return <StyledContent>"loading..."</StyledContent>;
    }
  };
}

export default withRouter(VideoConferencingRoom);

const StyledContent = styled.div`
  display: flex;
  width: calc(100vw - 140px);
  height: calc(100vh - 70px);
  flex-direction: row;
`;

const ParticipantListContainer = styled.div`
  width: 240px;
  height: calc((100vh - 70px) / 2);
  overflow: auto;
  border: 1px solid black;
  border-bottom: none;
`;

const ParticipantContainer = styled.div`
  width: 100%;
  height: 50px;
  border-bottom: 1px black solid;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ParticipantNameContainer = styled.div`
  width: 140px;
  margin-left: 20px;
`;

const StatusContainer = styled.div`
  width: 100px;
  display: flex;
  justify-content: right;
`;
