import React, { Component } from "react";
import styled from "styled-components";
import { Button, Modal, Form, Checkbox, Message } from "semantic-ui-react";
import { v4 as uuidv4 } from "uuid";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

export default class settingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomList: this.props.roomList,
      userList: this.props.userList,
      loginUser: this.props.loginUser,
      selectedRoom: this.props.selectedRoom,
      participantEmail: "",
      edited: false,
      confirmDeleteModal: false,

      // Errors
      roomNameError: "",
      startTimeError: "",
      endTimeError: "",
      emailError: "",
    };
  }

  componentDidUpdate() {
    if (this.state.userList !== this.props.userList && this.props.userList) {
      this.setState({ userList: this.props.userList });
    }

    if (this.state.selectedRoom !== this.props.selectedRoom && this.props.selectedRoom && !this.state.edited) {
      let tempSelectedRoom = this.props.selectedRoom;

      if (this.props.action === "create") {
        tempSelectedRoom.startTime.setHours(tempSelectedRoom.startTime.getHours() + 1);
        tempSelectedRoom.endTime.setHours(tempSelectedRoom.startTime.getHours() + 1);
      }

      this.setState({ selectedRoom: tempSelectedRoom });
    }

    if (this.state.edited && !this.props.settingModal) {
      this.setState({ edited: false, participantEmail: "", confirmDeleteModal: false });
    }

    if (
      (this.state.roomNameError.length > 0 ||
        this.state.startTimeError.length > 0 ||
        this.state.endTimeError.length > 0 ||
        this.state.emailError.length > 0) &&
      !this.props.settingModal
    ) {
      this.clearError();
    }
  }

  clearError = () => {
    this.setState({
      roomNameError: "",
      startTimeError: "",
      endTimeError: "",
      emailError: "",
    });
  };

  handleChange = (e) => {
    let tempRoom = Object.assign({}, this.state.selectedRoom);

    if (e.target.id === "participantEmail") {
      this.setState({ [e.target.id]: e.target.value });
    } else if (e.target.id === "startTime" || e.target.id === "endTime") {
      let year = e.target.value.substring(0, 4);
      let month = e.target.value.substring(5, 7);
      let date = e.target.value.substring(8, 10);
      let hours = e.target.value.substring(11, 13);
      let minutes = e.target.value.substring(14, 16);
      let tempDateTime = new Date(year, month - 1, date, hours, minutes);
      tempRoom[e.target.id] = tempDateTime;
    } else if (e.target.id === "roomName" || e.target.id === "chatTimeout") tempRoom[e.target.id] = e.target.value;
    else tempRoom[e.target.id] = e.target.checked;

    this.setState({ edited: true, selectedRoom: tempRoom });
  };

  // Convert date to (YYYY-MM-DDTHH:MM)
  getSettingDate = (dateTime) => {
    if (dateTime) {
      let date =
        dateTime.getFullYear() +
        "-" +
        ("0" + (dateTime.getMonth() + 1)).slice(-2) +
        "-" +
        ("0" + dateTime.getDate()).slice(-2);
      let time = ("0" + dateTime.getHours()).slice(-2) + ":" + ("0" + dateTime.getMinutes()).slice(-2);
      let result = date + "T" + time;

      return result;
    }
  };

  // Convert timestamp from firebase to string (DD/MM/YYYY HH/MM)
  getDisplayDate = (dateTime) => {
    let date = dateTime.getDate() + "/" + (dateTime.getMonth() + 1) + "/" + dateTime.getFullYear();
    let time = dateTime.getHours() + ":" + ("0" + dateTime.getMinutes()).slice(-2);
    let result = date + " " + time;
    return result;
  };

  // Invite participant to a room
  inviteParticipant = () => {
    this.clearError();
    let tempParticipantIdList = JSON.parse(JSON.stringify(this.state.selectedRoom.participantIdList));
    let loginUser = this.state.loginUser;
    let email = this.state.participantEmail;
    let emailError = "";
    let exist = false;

    // Validate email
    if (!email || email.length === 0) emailError = "Email is invalid.";

    // Check if user exist
    if (this.state.userList && this.state.userList.length > 0) {
      // eslint-disable-next-line
      this.state.userList.map((eachUser) => {
        if (eachUser.email === email) exist = true;
      });
    }
    if (!exist) emailError = "The user is not exist.";

    // Check if user has been invited
    if (tempParticipantIdList && tempParticipantIdList.length > 0) {
      // eslint-disable-next-line
      tempParticipantIdList.map((eachParticipant) => {
        if (eachParticipant === email) emailError = "The user has been invited.";
      });
    }

    // Check if the user is the owner
    if (loginUser.email === email) emailError = "You cannot invite youself.";

    // If error occur
    if (emailError.length > 0) {
      this.setState({ emailError: emailError });
      return;
    }

    // If no error occur
    tempParticipantIdList.push(email);
    let tempRoom = this.state.selectedRoom;
    tempRoom.participantIdList = tempParticipantIdList;
    this.setState({ edited: true, selectedRoom: tempRoom, participantEmail: "" });
  };

  // Remove participant from a room
  removeParticipant = (id) => {
    let tempParticipantIdList = [];
    let tempRoom = Object.assign({}, this.state.selectedRoom);

    // eslint-disable-next-line
    tempRoom.participantIdList.map((eachParticipant) => {
      if (eachParticipant !== id) {
        tempParticipantIdList.push(eachParticipant);
      }
    });

    tempRoom.participantIdList = tempParticipantIdList;
    this.setState({ edited: true, selectedRoom: tempRoom });
  };

  // Generate participant in a room (2/row)
  generateParticipant = () => {
    let collectedParticipants = [];
    let tempParticipants = [];
    let participantIdList = this.state.selectedRoom ? this.state.selectedRoom.participantIdList : [];
    let userList = this.state.userList;

    if (participantIdList && participantIdList.length > 0 && userList && userList.length > 0) {
      // eslint-disable-next-line
      participantIdList.map((eachParticipantId, i) => {
        // eslint-disable-next-line
        userList.map((eachUser) => {
          if (eachParticipantId === eachUser.email) {
            tempParticipants.push(
              <StyledParticipantContainer key={eachUser.email}>
                <Button
                  icon="remove circle"
                  onClick={() => this.removeParticipant(eachUser.email)}
                  style={{ marginRight: "20px" }}
                  negative
                />
                <AlignVertical>
                  <div style={{ fontsize: "14px", fontWeight: "800" }}>{eachUser.name}</div>
                  <div style={{ fontsize: "14px" }}>{eachUser.email}</div>
                </AlignVertical>
              </StyledParticipantContainer>
            );
          }
        });
        if (i % 2 !== 0 || participantIdList.length === i + 1) {
          collectedParticipants.push(
            <Form.Group widths="equal" key={i}>
              {tempParticipants}
            </Form.Group>
          );
          tempParticipants = [];
        }
      });
    }

    return collectedParticipants;
  };

  // Validation for selected room
  validation = () => {
    this.clearError();
    let error = false;
    let roomNameError = "";
    let startTimeError = "";
    let endTimeError = "";

    let roomName = this.state.selectedRoom.roomName;
    let today = new Date();
    let startTime = this.state.selectedRoom.startTime;
    let endTime = this.state.selectedRoom.endTime;

    // Validate empty room name
    if (!roomName) roomNameError = "Room name is invalid.";

    // Validate start time not less than today
    if (startTime <= today) startTimeError = `Start time must be after ${this.getDisplayDate(today)}`;

    // Validate end time not less than start time
    if (endTime <= startTime) endTimeError = `End time must be after ${this.getDisplayDate(startTime)}`;

    if (roomNameError.length > 0 || startTimeError.length > 0 || endTimeError.length > 0) {
      this.setState({
        roomNameError: roomNameError,
        startTimeError: startTimeError,
        endTimeError: endTimeError,
      });
      error = true;
    }

    return error;
  };

  // Update selected room (will change to firebase)
  updateRoom = async () => {
    if (this.validation()) return;

    if (this.props.action === "edit") {
      let selectedRoom = this.state.selectedRoom;
      let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
      await updateDoc(roomRef, {
        roomName: selectedRoom.roomName,
        startTime: selectedRoom.startTime,
        endTime: selectedRoom.endTime,
        chatTimeout: selectedRoom.chatTimeout,
        autoRecord: selectedRoom.autoRecord,
        textToSpeech: selectedRoom.textToSpeech,
        popup: selectedRoom.popup,
        raiseHand: selectedRoom.raiseHand,
        chat: selectedRoom.chat,
        mic: selectedRoom.mic,
        camera: selectedRoom.camera,
        shareScreen: selectedRoom.shareScreen,
        emoji: selectedRoom.emoji,
        participantIdList: selectedRoom.participantIdList ? selectedRoom.participantIdList : [],
      });
    } else if (this.props.action === "create") {
      let id = uuidv4();
      let selectedRoom = this.state.selectedRoom;

      let roomRef = doc(db, "videoConferencingRooms", id);
      await setDoc(roomRef, {
        id: id,
        roomName: this.state.selectedRoom.roomName,
        status: "active",
        ownerId: this.state.loginUser.email,
        startTime: selectedRoom.startTime,
        endTime: selectedRoom.endTime,
        chatTimeout: selectedRoom.chatTimeout,
        autoRecord: selectedRoom.autoRecord,
        textToSpeech: selectedRoom.textToSpeech,
        popup: selectedRoom.popup,
        raiseHand: selectedRoom.raiseHand,
        chat: selectedRoom.chat,
        mic: selectedRoom.mic,
        camera: selectedRoom.camera,
        shareScreen: selectedRoom.shareScreen,
        emoji: selectedRoom.emoji,
        participantIdList: selectedRoom.participantIdList,
        pollIdList: selectedRoom.pollIdList,
        recordingIdList: selectedRoom.recordingIdList,
        attendanceId: selectedRoom.attendanceId,
        participantInRoomList: [],
      });

      // Create new chat history
      let chatHistoryRef = doc(db, "chatHistory", id);
      await setDoc(chatHistoryRef, {
        id: id,
        messageList: [],
      });

      // Create new attendance
      let attendanceRef = doc(db, "attendance", id);
      await setDoc(attendanceRef, {
        id: id,
        attendeeIdList: [],
        attendanceList: [],
      });
    }

    this.props.handleModal(false, null, "close");
  };

  // Delete selected room
  deleteRoom = async () => {
    // Change status to inactive (amend the code in home.js)
    // let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
    // await updateDoc(roomRef, { status: "inactive" });

    // Delete room data
    let roomRef = doc(db, "videoConferencingRooms", this.state.selectedRoom.id);
    await deleteDoc(roomRef);

    // Delete chat history data
    let chatHistoryRef = doc(db, "chatHistory", this.state.selectedRoom.id);
    await deleteDoc(chatHistoryRef);

    // Delete related poll data
    this.state.selectedRoom.pollIdList.map(async (eachPollId) => {
      let pollRef = doc(db, "poll", eachPollId);
      await deleteDoc(pollRef);
    });

    // Delete attendance data
    let attendanceRef = doc(db, "attendance", this.state.selectedRoom.id);
    await deleteDoc(attendanceRef);

    this.handleConfirmDeleteModal(false);
  };

  handleConfirmDeleteModal = (status) => {
    this.setState({ confirmDeleteModal: status });
  };

  // Room settings (Top part)
  renderSetting = () => {
    return (
      <Form>
        <Form.Group widths="equal">
          <Form.Field error={this.state.roomNameError.length > 0}>
            <Form.Input
              id="roomName"
              placeholder="Room Name"
              value={this.state.selectedRoom ? this.state.selectedRoom.roomName : ""}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field></Form.Field>
        </Form.Group>

        {this.state.roomNameError && (
          <Form.Group widths="equal">
            <Form.Field>
              {this.state.roomNameError && <Message negative size={"tiny"} content={this.state.roomNameError} />}
            </Form.Field>
            <Form.Field></Form.Field>
          </Form.Group>
        )}

        <Form.Group widths="equal">
          <Form.Field error={this.state.startTimeError.length > 0}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <div style={{ width: "100px" }}>Start Time:</div>
              <input
                id="startTime"
                type="datetime-local"
                value={this.state.selectedRoom ? this.getSettingDate(this.state.selectedRoom.startTime) : ""}
                onChange={this.handleChange}
                error={this.state.startTimeError ? this.state.startTimeError : null}
              />
            </div>
          </Form.Field>
          <Form.Field error={this.state.endTimeError.length > 0}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
              <div style={{ width: "100px" }}>End Time:</div>
              <input
                id="endTime"
                type="datetime-local"
                value={this.state.selectedRoom ? this.getSettingDate(this.state.selectedRoom.endTime) : ""}
                onChange={this.handleChange}
                error={this.state.endTimeError ? this.state.endTimeError : null}
              />
            </div>
          </Form.Field>
        </Form.Group>

        {(this.state.startTimeError || this.state.endTimeError) && (
          <Form.Group widths="equal">
            <Form.Field>
              {this.state.startTimeError && (
                <Message negative size={"tiny"}>
                  {this.state.startTimeError}
                </Message>
              )}
            </Form.Field>
            <Form.Field>
              {this.state.endTimeError && (
                <Message negative size={"tiny"}>
                  {this.state.endTimeError}
                </Message>
              )}
            </Form.Field>
          </Form.Group>
        )}

        <Form.Group widths="equal">
          <Form.Field>
            <Checkbox
              id="autoRecord"
              label="Recording will start automatically"
              checked={this.state.selectedRoom ? this.state.selectedRoom.autoRecord : false}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              id="chat"
              label="Participant chat function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.chat : true}
              onChange={this.handleChange}
            />
          </Form.Field>
        </Form.Group>

        <Form.Group widths="equal">
          <Form.Field>
            <Checkbox
              id="textToSpeech"
              label="Text-to-speech function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.textToSpeech : false}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              id="mic"
              label="Participant mic function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.mic : true}
              onChange={this.handleChange}
            />
          </Form.Field>
        </Form.Group>

        <Form.Group widths="equal">
          <Form.Field>
            <Checkbox
              id="popup"
              label="Popup notification"
              checked={this.state.selectedRoom ? this.state.selectedRoom.popup : true}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              id="camera"
              label="Participant camera function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.camera : true}
              onChange={this.handleChange}
            />
          </Form.Field>
        </Form.Group>

        <Form.Group widths="equal">
          <Form.Field>
            <Checkbox
              id="emoji"
              label="Emoji function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.emoji : true}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              id="shareScreen"
              label="Participant share screen function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.shareScreen : true}
              onChange={this.handleChange}
            />
          </Form.Field>
        </Form.Group>

        <Form.Group widths="equal">
          <Form.Field>
            <Checkbox
              id="raiseHand"
              label="Raise hand function"
              checked={this.state.selectedRoom ? this.state.selectedRoom.raiseHand : true}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            Chat timeout length: {this.state.selectedRoom ? this.state.selectedRoom.chatTimeout : 0} second(s)
            <StyledSlider
              id="chatTimeout"
              type="range"
              min={0}
              max={60}
              value={this.state.selectedRoom ? this.state.selectedRoom.chatTimeout : 0}
              onChange={this.handleChange}
            />
          </Form.Field>
        </Form.Group>
      </Form>
    );
  };

  // Participants part (Middle part)
  renderParticipant = () => {
    return (
      <Form>
        <Form.Group widths="equal">
          <Form.Field error={this.state.emailError.length > 0}>
            <Form.Input
              id="participantEmail"
              placeholder="Participant's email"
              value={this.state.participantEmail ? this.state.participantEmail : ""}
              onChange={this.handleChange}
            />
          </Form.Field>
          <Form.Field>
            <Button positive onClick={() => this.inviteParticipant()}>
              Invite
            </Button>
          </Form.Field>
        </Form.Group>

        {this.state.emailError && (
          <Form.Group widths="equal">
            <Form.Field>
              {this.state.emailError && <Message negative size={"tiny"} content={this.state.emailError} />}
            </Form.Field>
            <Form.Field></Form.Field>
          </Form.Group>
        )}

        {this.generateParticipant()}
      </Form>
    );
  };

  // Main
  render = () => {
    return (
      <div>
        <Modal closeIcon open={this.props.settingModal} onClose={() => this.props.handleModal(false, null, "close")}>
          <Modal.Header>Room Setting</Modal.Header>

          <Modal.Content scrolling>
            <Modal.Content>
              <Modal.Description>{this.renderSetting()}</Modal.Description>
            </Modal.Content>

            <Modal.Content style={{ borderTop: "1px solid #C4C4C4", paddingTop: "21px" }}>
              <Modal.Description>{this.renderParticipant()}</Modal.Description>
            </Modal.Content>
          </Modal.Content>

          <Modal.Actions style={{ marginRight: "10px" }}>
            {this.props.action === "edit" && this.props.roomList && (
              <Button negative onClick={() => this.handleConfirmDeleteModal(true)}>
                Delete Room
              </Button>
            )}
            <Button negative onClick={() => this.props.handleModal(false, null, "close")}>
              Cancel
            </Button>
            <Button positive onClick={() => this.updateRoom()}>
              Confirm
            </Button>
          </Modal.Actions>
        </Modal>

        <Modal
          closeIcon
          open={this.state.confirmDeleteModal}
          onClose={() => this.handleConfirmDeleteModal(false)}
          size={"small"}
        >
          <Modal.Header>Are you sure you want to delete this room?</Modal.Header>

          <Modal.Actions>
            <Button negative onClick={() => this.handleConfirmDeleteModal(false)}>
              No
            </Button>
            <Button positive onClick={() => this.deleteRoom()}>
              Yes
            </Button>
          </Modal.Actions>
        </Modal>
      </div>
    );
  };
}

const StyledSlider = styled.input`
  width: 300px;
`;

const StyledParticipantContainer = styled.div`
  width: 47%;
  margin-left: 10px;
  margin-right: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 10px;
  border: 1px solid #c4c4c4;
  border-radius: 10px;
`;

const AlignVertical = styled.div`
  display: flex;
  flex-direction: column;
`;
