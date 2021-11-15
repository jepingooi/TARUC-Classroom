import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Icon, Button } from "semantic-ui-react";
import { v4 as uuidv4 } from "uuid";
import { toast, ToastContainer } from "react-toastify";

// Modals
import SettingModal from "./settingModal";
import PollModal from "./pollModal";
import ChatBox from "./chatBox";
import ScreenRecordingModal from "./screenRecordingModal";
import Room from "./connection";
import UserControlModal from "./userControlModal";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDoc, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

let unsubRoom;
let unsubChatHistory;
let unsubAttendance;

let speech = new SpeechSynthesisUtterance();
speech.lang = "en-UK";

class VideoConferencingRoom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      attendanceMarked: false,
      screenSharing: false,
      firstJoin: true,

      // Modal
      shareScreenModal: false,
      recordingModal: false,
      settingModal: false,
      userControlModal: false,
    };
  }

  onUnload = (e) => {
    e.preventDefault();
    this.componentWillUnmount();
  };

  async componentWillUnmount() {
    toast.dismiss();
    this.handleAttendance("leave");

    this.handleHangUp(true);

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

    let attendanceRef = doc(db, "attendance", this.props.selectedRoomId);
    unsubAttendance = onSnapshot(attendanceRef, () => {
      this.getAttendanceFromFirebase();
    });
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

    // open recording modal on load according to room setting
    if (this.state.firstJoin && selectedRoom.autoRecord && this.props.loginUser.email === selectedRoom.ownerId) {
      this.handleModal("recordingModal", true);
      this.setState({ firstJoin: false });
    }

    let kicked = true;
    selectedRoom.participantInRoomList.forEach((user) => {
      if (user.id === this.props.loginUser.email || selectedRoom.ownerId === this.props.loginUser.email) kicked = false;
    });

    if (kicked) this.handleHangUp();
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
    chatHistorySnapshot.data().messageList.map((eachMessage, i) => {
      let tempMessage = {
        id: eachMessage.id,
        message: eachMessage.message,
        sender: eachMessage.sender,
        time: new Date(eachMessage.time.seconds * 1000),
      };
      if (
        this.state.chatMessageList &&
        JSON.stringify(this.state.chatMessageList[i]) !== JSON.stringify(tempMessage) &&
        eachMessage.sender !== this.props.loginUser.name
      ) {
        let message = "";
        if (eachMessage.message.substring(0, 2) === "**") message = `${eachMessage.message}`;
        else message = `${eachMessage.sender} said ${eachMessage.message}.`;

        toast(message);
        speech.text = message;

        if (this.state.selectedRoom?.textToSpeech) window.speechSynthesis.speak(speech);
      }
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
      if (!this.state.attendance.attendeeIdList.includes(this.props.loginUser.email)) {
        let tempAttendeeIdList = this.state.attendance.attendeeIdList;
        tempAttendeeIdList.push(this.props.loginUser.email);
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
        attendeeName: this.props.loginUser.name,
        attendeeId: this.props.loginUser.email,
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
        attendeeName: this.props.loginUser.name,
        attendeeId: this.props.loginUser.email,
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

  // Input new message in chat box
  inputNewMessage = async (message) => {
    let tempChatMessageList = this.state.chatMessageList;
    let id = uuidv4();

    tempChatMessageList.push({
      id: id,
      message: message,
      sender: this.props.loginUser.name,
      time: new Date(),
    });

    let chatHistoryRef = doc(db, "chatHistory", this.state.selectedRoom.id);
    await updateDoc(chatHistoryRef, { messageList: tempChatMessageList });
  };

  // Raise hand
  handleRaiseHand = async () => {
    let onlineUserList = Object.assign([], this.state.selectedRoom.participantInRoomList);

    // eslint-disable-next-line
    onlineUserList.map((eachUser) => {
      if (eachUser.id === this.props.loginUser.email) {
        if (!eachUser.raiseHand) this.inputNewMessage(`**${this.props.loginUser.name} raised hand.**`);

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

  // Screen sharing
  handleScreenSharing = (status) => {
    this.setState({ screenSharing: status });
  };

  // Hang up function
  handleHangUp = async (notButton) => {
    if (!this.state.selectedRoom) return;

    let tempParticipantInRoomList = [];
    let participantInRoomList = this.state.selectedRoom.participantInRoomList;

    // eslint-disable-next-line
    participantInRoomList.map((eachParticipant) => {
      if (
        eachParticipant.id !== this.props.loginUser.email &&
        eachParticipant.id !== `shareScreen_${this.props.loginUser.email}`
      )
        tempParticipantInRoomList.push(eachParticipant);
    });

    let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: tempParticipantInRoomList });

    if (!notButton) {
      this.props.handleNavigation("videoConferencing", null);
      this.props.history.push(`/videoConferencing`);
    }
  };

  // Handle open or close modal
  handleModal = (type, status, action) => {
    let tempAction = action;

    // Poll action
    if (this.props.loginUser?.email === this.state.selectedRoom.ownerId && type === "pollModal" && status === true) {
      tempAction = "create";
    } else if (type === "pollModal" && status === true) tempAction = "answer";

    if (type !== "userControlModal") this.setState({ [type]: status, action: tempAction });
    else this.setState({ [type]: status, selectedUser: action });
  };

  // Generate participants on the left (login user will be shown first)
  renderParticipants = () => {
    let onlineUserList = Object.assign([], this.state.selectedRoom.participantInRoomList);
    let sharingScreenIcon = <Icon name="laptop" style={{ marginRight: "10px" }} />;
    let cameraOnIcon = <Icon name="video camera" style={{ marginRight: "10px" }} />;
    let microphoneMutedIcon = <Icon name="microphone slash" style={{ marginRight: "10px" }} />;
    let raiseHandIcon = <Icon name="hand paper" style={{ marginRight: "10px" }} />;
    let forcedMutedIcon = <Icon name="microphone slash" style={{ marginRight: "10px" }} color="red" />;

    let onlineUser = [];
    let otherUser = [];

    onlineUserList.forEach((eachUser) => {
      let forceMuted = false;
      this.state.selectedRoom.invitedParticipantList.forEach((invitedUser) => {
        if (eachUser.id === invitedUser.id && invitedUser.muted) forceMuted = true;
      });

      let statusContainer = (
        <StatusContainer>
          {eachUser.shareScreen && sharingScreenIcon}
          {eachUser.camera && cameraOnIcon}
          {!eachUser.mic && !forceMuted && microphoneMutedIcon}
          {forceMuted && forcedMutedIcon}
          {eachUser.raiseHand && raiseHandIcon}
        </StatusContainer>
      );

      let user = {
        muted: forceMuted,
        id: eachUser.id,
      };

      if (eachUser.type !== "screenSharing") {
        if (eachUser.id === this.props.loginUser.email) {
          onlineUser.push(
            <ParticipantContainer key={`loginUser${eachUser.id}`}>
              <ParticipantNameContainer>{eachUser.name}</ParticipantNameContainer>
              {statusContainer}
            </ParticipantContainer>
          );
        } else {
          otherUser.push(
            <ParticipantContainer key={`otherUser${eachUser.id}`}>
              <ParticipantNameContainer>{eachUser.name}</ParticipantNameContainer>
              {statusContainer}
              {this.props.loginUser.email === this.state.selectedRoom.ownerId && (
                <Button
                  icon="ellipsis vertical"
                  style={{ marginRight: "10px" }}
                  onClick={() => this.handleModal("userControlModal", true, user)}
                  size="mini"
                />
              )}
            </ParticipantContainer>
          );
        }
      }
    });

    onlineUser = onlineUser.concat(otherUser);

    return onlineUser;
  };

  // Setting modal
  renderRoomSettingModal = () => {
    return (
      <SettingModal
        handleModal={(status) => this.handleModal("settingModal", status)}
        action={this.state.action}
        settingModal={this.state.settingModal}
        selectedRoom={this.state.selectedRoom}
        loginUser={this.props.loginUser}
        userList={this.state.userList}
      />
    );
  };

  // Poll modal
  renderPollModal = () => {
    return (
      <PollModal
        handleModal={(status) => this.handleModal("pollModal", status)}
        loginUser={this.props.loginUser}
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
        loginUser={this.props.loginUser}
      />
    );
  };

  renderChatBox = () => {
    return (
      <ChatBox
        chatMessageList={this.state.chatMessageList}
        loginUser={this.props.loginUser}
        selectedRoom={this.state.selectedRoom}
      />
    );
  };

  renderMainScreen = () => {
    return (
      <Room
        selectedRoom={this.state.selectedRoom}
        loginUser={this.props.loginUser}
        handleModal={(type, status, action) => this.handleModal(type, status, action)}
        handleRaiseHand={() => this.handleRaiseHand()}
        recording={this.state.recording}
        screenSharing={this.state.screenSharing}
        handleScreenSharing={(status) => this.handleScreenSharing(status)}
        joinRoom={(screenSharing) => this.props.joinRoom(this.state.selectedRoom.id, screenSharing)}
        handleHangUp={() => this.handleHangUp()}
      />
    );
  };

  renderUserControlModal = () => {
    return (
      <UserControlModal
        userControlModal={this.state.userControlModal}
        handleModal={() => this.handleModal("userControlModal", false)}
        selectedUser={this.state.selectedUser}
        userList={this.state.userList}
        selectedRoom={this.state.selectedRoom}
      />
    );
  };

  render = () => {
    if (this.state.selectedRoom && this.state.userList && this.props.loginUser) {
      return (
        <StyledContent>
          {this.state.selectedRoom.popup && (
            <ToastContainer position="bottom-right" closeOnClick newestOnTop={false} pauseOnHover />
          )}
          {this.props.loginUser?.email === this.state.selectedRoom.ownerId && this.renderRoomSettingModal()}

          {(this.state.selectedRoom?.pollIdList?.length > 0 ||
            this.props.loginUser?.email === this.state.selectedRoom.ownerId) &&
            this.renderPollModal()}

          {this.renderRecordingModal()}

          {this.state.selectedUser && this.renderUserControlModal()}

          <div>
            <ParticipantListContainer>{this.renderParticipants()}</ParticipantListContainer>
            {this.renderChatBox()}
          </div>

          {this.renderMainScreen()}
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
  width: 100%;
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
  align-items: center;
`;
