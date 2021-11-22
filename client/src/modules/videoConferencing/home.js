import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Table, Menu, Icon } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";

// Download to PDF
import jsPDF from "jspdf";
import "jspdf-autotable";

// Modals
import SettingModal from "./settingModal";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot, query, where, getDoc, doc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

// Default room setting
const defaultRoom = {
  id: "",
  roomName: "",
  status: "new",
  ownerId: "",
  startTime: new Date(),
  endTime: new Date(),
  chatTimeout: 0,
  autoRecord: false,
  textToSpeech: false,
  popup: true,
  raiseHand: true,
  chat: true,
  mic: true,
  camera: true,
  shareScreen: true,
  emoji: true,
  invitedParticipantList: [],
  pollIdList: [],
  recordingIdList: [],
  chatHistoryId: "",
  attendanceId: "",
  participantInRoomList: [],
};

let unsubRoomRef;
let unSubAllRoomRef;

export default class VideoConferencingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      selectedRoom: null,
      settingModal: false,
    };
  }

  async componentWillUnmount() {
    toast.dismiss();

    if (unsubRoomRef) await unsubRoomRef();
    if (unSubAllRoomRef) await unSubAllRoomRef();
  }

  componentDidMount() {
    unSubAllRoomRef = onSnapshot(collection(db, "videoConferencingRooms"), () => {
      this.getRoomFromFirebase();
    });

    this.getUserFromFirebases();
  }

  // Get all users from firebase
  getUserFromFirebases = async () => {
    let tempUserList = [];
    let staffRef = collection(db, "staff");
    let staffQuerySnapshot = await getDocs(staffRef);
    staffQuerySnapshot.forEach((doc) => {
      tempUserList.push(doc.data());
    });

    let studentsRef = collection(db, "students");
    let studentsQuerySnapshot = await getDocs(studentsRef);
    studentsQuerySnapshot.forEach((doc) => {
      tempUserList.push(doc.data());
    });

    this.setState({ userList: tempUserList });
  };

  // Get all rooms from firebase
  getRoomFromFirebase = async () => {
    let roomRef = collection(db, "videoConferencingRooms");
    let roomQuerySnapshot = await getDocs(roomRef);
    let roomList = [];

    roomQuerySnapshot.forEach((doc) => {
      let tempRoom = doc.data();

      tempRoom.startTime = new Date(tempRoom.startTime.seconds * 1000);
      tempRoom.endTime = new Date(tempRoom.endTime.seconds * 1000);

      roomList.push(tempRoom);
    });

    this.setState({ roomList: roomList });
  };

  // Get attendance from firebase
  getAttendanceFromFirebase = async (roomID) => {
    let attendaceRef = doc(db, "attendance", roomID);
    let attendanceSnapshot = await getDoc(attendaceRef);
    let attendance = attendanceSnapshot.data();

    if (attendance) {
      if (attendance.attendanceList.length > 0) {
        // eslint-disable-next-line
        attendance.attendanceList.map((eachAttendance) => {
          eachAttendance.time = new Date(eachAttendance.time.seconds * 1000);
        });
      }
      return attendance;
    }
  };

  // Get chat history from firebase
  getChatHistoryFromFirebases = async (roomID) => {
    let chatHistoryRef = doc(db, "chatHistory", roomID);
    let chatHistorySnapshot = await getDoc(chatHistoryRef);
    let chatMessageList = [];

    // eslint-disable-next-line
    chatHistorySnapshot.data()?.messageList?.map((eachMessage, i) => {
      let tempMessage = {
        id: eachMessage.id,
        message: eachMessage.message,
        sender: eachMessage.sender,
        time: new Date(eachMessage.time.seconds * 1000),
      };

      if (eachMessage.message.substring(0, 2) !== "**") chatMessageList.push(tempMessage);
    });

    return chatMessageList;
  };

  // Get all poll
  getPollFromFirebase = async (pollIdList) => {
    let tempPollList = [];

    let pollRef = collection(db, "poll");
    let pollQuerySnapshot = await getDocs(pollRef);
    pollQuerySnapshot.forEach((doc) => {
      if (pollIdList.includes(doc.data().id)) tempPollList.push(doc.data());
    });

    return tempPollList;
  };

  // Sort room (owner room - joined room)
  sortRoom = () => {
    let tempRoomList = [];
    let participantRoom = [];

    if (this.state.roomList) {
      // eslint-disable-next-line
      this.state.roomList.map((eachRoom) => {
        if (eachRoom.status === "active") {
          let filterRoom = eachRoom.invitedParticipantList.filter((list) => list.id === this.props.loginUser.email);
          let today = new Date();

          if (eachRoom.ownerId === this.props.loginUser.email) tempRoomList.push(eachRoom);
          else if (filterRoom.length > 0 && today < eachRoom.endTime) participantRoom.push(eachRoom);
        }
      });
      tempRoomList.sort((a, b) => a.roomName.localeCompare(b.roomName));
      participantRoom.sort((a, b) => a.roomName.localeCompare(b.roomName));
      tempRoomList = tempRoomList.concat(participantRoom);
    }

    return tempRoomList;
  };

  // Pagination
  paging = (page) => {
    if (page === "next") {
      this.setState({ page: this.state.page + 1 });
    } else if (page === "back") this.setState({ page: this.state.page - 1 });
    else this.setState({ page: page });
  };

  // Match owner id to get owner name
  getOwnerName = (ownerId) => {
    let ownerName = "";

    if (this.state.userList?.length > 0) {
      // eslint-disable-next-line
      this.state.userList.map((eachUser) => {
        if (eachUser.email === ownerId) {
          ownerName = eachUser.name;
        }
      });
    }
    return ownerName;
  };

  // Convert Date to string (DD/MM/YYYY HH/MM)
  getRoomDate = (dateTime) => {
    let date = dateTime.getDate() + "/" + (dateTime.getMonth() + 1) + "/" + dateTime.getFullYear();
    let time = dateTime.getHours() + ":" + ("0" + dateTime.getMinutes()).slice(-2);
    let result = date + " " + time;
    return result;
  };

  getParticipantInRoomNumber = (room) => {
    let num = 0;
    if (room.participantInRoomList) {
      room.participantInRoomList.forEach((eachParticipant) => {
        if (eachParticipant.type !== "screenSharing") num++;
      });
    }

    return num;
  };

  generateAttendanceReport = async (room) => {
    let attendance = await this.getAttendanceFromFirebase(room.id);

    let unit = "pt";
    let size = "A4"; // Use A1, A2, A3 or A4
    let orientation = "portrait"; // portrait or landscape

    let marginLeft = 40;
    let doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);

    let today = new Date();
    // Format date to DD/MM/YYYY
    let formattedDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    let title = `Attendance report`;
    let generateDate = `Date - ${formattedDate}`;
    let generateBy = `Generated by - ${this.props.loginUser.name}`;
    let generateRoom = `Generated in room - ${room.roomName}`;
    let totalAttendees = `Total attendees - ${attendance.attendeeIdList.length} `;
    let startTime = `Start time - ${this.getRoomDate(room.startTime)}`;
    let endTime = `End time - ${this.getRoomDate(room.endTime)}`;
    let headers = [["No.", "Attendee name", "Join/ Leave time", "Action", "Notes"]];

    let data = attendance.attendanceList.map((attendance, i) => [
      i + 1,
      attendance.attendeeName,
      this.getRoomDate(attendance.time),
      attendance.action,
      attendance.notes,
    ]);

    let content = {
      startY: 180,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.setFontSize(12);
    doc.text(generateDate, marginLeft, 60);
    doc.text(generateBy, marginLeft, 80);
    doc.text(generateRoom, marginLeft, 100);
    doc.text(totalAttendees, marginLeft, 120);
    doc.text(startTime, marginLeft, 140);
    doc.text(endTime, marginLeft, 160);
    doc.autoTable(content);
    doc.save(`Attendance report.pdf`);
  };

  generateChatMessagesReport = async (room) => {
    let chatMessages = await this.getChatHistoryFromFirebases(room.id);

    let unit = "pt";
    let size = "A4"; // Use A1, A2, A3 or A4
    let orientation = "portrait"; // portrait or landscape

    let marginLeft = 40;
    let doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);

    let today = new Date();
    // Format date to DD/MM/YYYY
    let formattedDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    let title = `Chat messages report`;
    let generateDate = `Date - ${formattedDate}`;
    let generateBy = `Generated by - ${this.props.loginUser.name}`;
    let generateRoom = `Generated in room - ${room.roomName}`;
    let totalMessages = `Total messages - ${chatMessages.length} `;
    let headers = [["No.", "Sender", "Time", "Message"]];

    let data = chatMessages.map((message, i) => [
      i + 1,
      message.sender,
      this.getRoomDate(message.time),
      message.message,
    ]);

    let content = {
      startY: 140,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.setFontSize(12);
    doc.text(generateDate, marginLeft, 60);
    doc.text(generateBy, marginLeft, 80);
    doc.text(generateRoom, marginLeft, 100);
    doc.text(totalMessages, marginLeft, 120);
    doc.autoTable(content);
    doc.save(`Chat messages report.pdf`);
  };

  generatePollReport = async (room) => {
    let polls = await this.getPollFromFirebase(room.pollIdList);

    let unit = "pt";
    let size = "A4"; // Use A1, A2, A3 or A4
    let orientation = "portrait"; // portrait or landscape

    let marginLeft = 40;
    let doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);

    let today = new Date();
    // Format date to DD/MM/YYYY
    let formattedDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    let title = `Poll report`;
    let generateDate = `Date - ${formattedDate}`;
    let generateBy = `Generated by - ${this.props.loginUser.name}`;
    let generateRoom = `Generated in room - ${room.roomName}`;
    let totalMessages = `Total polls in this room - ${polls.length} `;

    doc.text(title, marginLeft, 40);
    doc.setFontSize(12);
    doc.text(generateDate, marginLeft, 60);
    doc.text(generateBy, marginLeft, 80);
    doc.text(generateRoom, marginLeft, 100);
    doc.text(totalMessages, marginLeft, 120);
    polls.forEach((poll, i) => {
      let totalRespondent = `Total respondent - ${poll.respondentIdList.length} `;
      let question = `Question - ${poll.question}`;
      let headers = [["No.", "Option", "Total respondent"]];
      let data = poll.options.map((option, i) => [i + 1, option.option, option.amountSelected]);
      let content = {
        startY: i === 0 ? 180 : doc.lastAutoTable.finalY + 60,
        head: headers,
        body: data,
      };

      doc.text(totalRespondent, marginLeft, i === 0 ? 150 : doc.lastAutoTable.finalY + 30);
      doc.text(question, marginLeft, i === 0 ? 170 : doc.lastAutoTable.finalY + 50);
      doc.autoTable(content);
    });

    doc.save(`Poll report.pdf`);
  };

  generateReport = (room) => {
    this.generateAttendanceReport(room);
    this.generateChatMessagesReport(room);
    this.generatePollReport(room);
  };

  markAttendance = async (room) => {
    let attendance = await this.getAttendanceFromFirebase(room.id);

    let unit = "pt";
    let size = "A4"; // Use A1, A2, A3 or A4
    let orientation = "portrait"; // portrait or landscape

    let marginLeft = 40;
    let doc = new jsPDF(orientation, unit, size);
    doc.setFontSize(15);

    let today = new Date();
    // Format date to DD/MM/YYYY
    let formattedDate = today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();

    let title = `Mark attendance simulation`;
    let generateDate = `Date - ${formattedDate}`;
    let generateClass = `Class - ${room.roomName}`;
    let startTime = `Start time - ${this.getRoomDate(room.startTime)}`;
    let endTime = `End time - ${this.getRoomDate(room.endTime)}`;
    let headers = [["No.", "Participant ID", "Join time", "Leave time", "Action"]];

    // Generate user data
    let attendanceList = [];
    let ownerAttendance = [{}];

    attendance.attendanceList.forEach((attendance) => {
      if (attendance.attendeeId === room.ownerId) {
        ownerAttendance[0].id = attendance.attendeeId;
        ownerAttendance[0].leaveTime = this.getRoomDate(attendance.time);
        if (!ownerAttendance[0].joinTime) {
          ownerAttendance[0].joinTime = this.getRoomDate(attendance.time);
          if (attendance.notes === "Late") ownerAttendance[0].action = "Late";
          else ownerAttendance[0].action = "attend";
        }
      }
    });

    if (!ownerAttendance[0].action)
      ownerAttendance[0] = {
        id: this.props.loginUser.email,
        joinTime: "-",
        leaveTime: "-",
        action: "absent",
      };

    room.invitedParticipantList.forEach((user) => {
      let userAttendance = {};
      attendance.attendanceList.forEach((attendance) => {
        if (attendance.attendeeId === user.id) {
          userAttendance.id = attendance.attendeeId;
          userAttendance.leaveTime = this.getRoomDate(attendance.time);
          if (!userAttendance.joinTime) {
            userAttendance.joinTime = this.getRoomDate(attendance.time);
            if (attendance.notes === "Late") userAttendance.action = "Late";
            else userAttendance.action = "attend";
          }
        }
      });

      if (!userAttendance.action)
        userAttendance = {
          id: user.id,
          joinTime: "-",
          leaveTime: "-",
          action: "absent",
        };

      attendanceList.push(userAttendance);
    });

    attendanceList = ownerAttendance.concat(attendanceList);

    let data = attendanceList.map((attendance, i) => [
      i + 1,
      attendance.id,
      attendance.joinTime,
      attendance.leaveTime,
      attendance.action,
    ]);

    let content = {
      startY: 140,
      head: headers,
      body: data,
    };

    doc.text(title, marginLeft, 40);
    doc.setFontSize(12);
    doc.text(generateDate, marginLeft, 60);
    doc.text(generateClass, marginLeft, 80);
    doc.text(startTime, marginLeft, 100);
    doc.text(endTime, marginLeft, 120);
    doc.autoTable(content);
    doc.save(`Mark attendance simulation.pdf`);
  };

  // Generate room for room list table
  generateRoomList = (roomList) => {
    let start = (this.state.page - 1) * 10;
    let end = this.state.page * 10;
    let collectedRoom = [];

    if (roomList?.length > 0) {
      // eslint-disable-next-line
      roomList.map((eachRoom, i) => {
        let ownerName = this.getOwnerName(eachRoom.ownerId);
        let startTime = this.getRoomDate(eachRoom.startTime);
        let endTime = this.getRoomDate(eachRoom.endTime);

        if (i >= start && i < end) {
          collectedRoom.push(
            <StyledRow key={eachRoom.id}>
              <StyledCell>{i + 1}</StyledCell>
              <StyledCell>{eachRoom.roomName}</StyledCell>
              <StyledCell>{ownerName}</StyledCell>
              <StyledCell>{startTime}</StyledCell>
              <StyledCell>{endTime}</StyledCell>
              <StyledCell>
                {this.getParticipantInRoomNumber(eachRoom)} /{" "}
                {eachRoom.invitedParticipantList ? eachRoom.invitedParticipantList.length + 1 : 0 + 1}
              </StyledCell>
              <StyledCell
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                }}
              >
                {eachRoom.ownerId === this.props.loginUser.email && (
                  <>
                    <Button
                      onClick={() => {
                        this.handleModal(true, eachRoom, "edit");
                      }}
                      icon="setting"
                      basic
                    />
                    <Button onClick={() => this.generateReport(eachRoom)} icon="download" basic />
                    <Button onClick={() => this.markAttendance(eachRoom)} icon="checkmark box" basic />
                  </>
                )}
                <Link to={`/videoConferencing/${eachRoom.id}`}>
                  <Button onClick={() => this.props.joinRoom(eachRoom.id)} icon="arrow right" basic />
                </Link>
              </StyledCell>
            </StyledRow>
          );
        }
      });
    }

    return collectedRoom;
  };

  // Generate 10 max room per page
  generatePagination = (roomList) => {
    let collectedPagination = [];
    let tempNum = Math.floor(roomList?.length / 10);

    for (let i = 0; i <= tempNum; i++) {
      collectedPagination.push(
        <Menu.Item key={i + 1} as="a" onClick={() => this.paging(i + 1)} active={this.state.page === i + 1}>
          {i + 1}
        </Menu.Item>
      );
    }

    return collectedPagination;
  };

  // Handle open or close modal
  handleModal = (status, room, action) => {
    // If delete room, automatically close the modal
    if (room && room.id.length > 0) {
      const queryRoom = query(collection(db, "videoConferencingRooms"), where("id", "==", room.id));
      unsubRoomRef = onSnapshot(queryRoom, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          // if (change.type === "added") {
          //   console.log("New room: ", change.doc.data());
          // }
          if (change.type === "modified") {
            this.getRoomFromFirebase();
          }
          if (change.type === "removed") {
            this.setState({ settingModal: false, selectedRoom: null });
          }
        });
      });
    }

    defaultRoom.startTime = new Date();
    defaultRoom.endTime = new Date();

    this.setState({ settingModal: status, selectedRoom: room, action: action });
  };

  // Pagination for room list table
  renderPagination = (roomList) => {
    if (roomList?.length > 10)
      return (
        <StyledMenuContainer>
          <Menu pagination>
            {this.state.page > 1 && (
              <Menu.Item as="a" icon onClick={() => this.paging("back")}>
                <Icon name="chevron left" />
              </Menu.Item>
            )}

            {this.generatePagination(roomList)}

            {this.state.page <= Math.floor(roomList.length / 10) && (
              <Menu.Item as="a" icon onClick={() => this.paging("next")}>
                <Icon name="chevron right" />
              </Menu.Item>
            )}
          </Menu>
        </StyledMenuContainer>
      );
  };

  // Room list table
  renderBottomTable = (roomList) => {
    if (roomList.length > 0) {
      return (
        <StyledTable>
          <Table celled>
            <Table.Header>
              <StyledRow>
                <Table.HeaderCell>No.</Table.HeaderCell>
                <Table.HeaderCell>Video Conferencing Room</Table.HeaderCell>
                <Table.HeaderCell>Room Owner</Table.HeaderCell>
                <Table.HeaderCell>Start Time</Table.HeaderCell>
                <Table.HeaderCell>End Time</Table.HeaderCell>
                <Table.HeaderCell>Participants</Table.HeaderCell>
                <Table.HeaderCell style={{ width: "100px", justifyContent: "center" }}>Actions</Table.HeaderCell>
              </StyledRow>
            </Table.Header>

            <Table.Body>{this.generateRoomList(roomList)}</Table.Body>
          </Table>
        </StyledTable>
      );
    } else
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "50px",
          }}
        >
          No room found.
        </div>
      );
  };

  // Title and create room button above table
  renderTopSide = () => {
    return (
      <StyledHeader>
        <LeftFont>Video Conferencing</LeftFont>
        <div style={{ flex: 1 }} />
        <RightButton positive onClick={() => this.handleModal(true, defaultRoom, "create")}>
          Create Room
        </RightButton>
      </StyledHeader>
    );
  };

  renderRoomSettingModal = () => {
    return (
      <SettingModal
        handleModal={(status) => this.handleModal(status, null, "close")}
        action={this.state.action}
        settingModal={this.state.settingModal}
        selectedRoom={this.state.selectedRoom}
        loginUser={this.props.loginUser}
        userList={this.state.userList}
        roomList={this.state.roomList}
      />
    );
  };

  // Main
  render = () => {
    let tempRoomList = this.sortRoom();

    return (
      <StyledContent>
        <ToastContainer
          position="bottom-right"
          closeOnClick
          newestOnTop={false}
          pauseOnFocusLoss={false}
          pauseOnHover={false}
        />
        {this.renderRoomSettingModal()}
        <StyledSubContent>
          {this.renderTopSide()}
          {this.renderBottomTable(tempRoomList)}
          {this.renderPagination(tempRoomList)}
        </StyledSubContent>
      </StyledContent>
    );
  };
}

const StyledContent = styled.div`
  display: flex;
  width: calc(100vw - 140px);
  height: calc(100vh - 70px);
`;

const StyledSubContent = styled.div`
  margin-top: 10px;
  margin-right: 50px;
  margin-left: 50px;
  height: calc(100vh - 170px);
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: row;
  width: calc(100vw - 100px);
  align-items: center;
`;

const LeftFont = styled.div`
  display: flex;
  font-size: 34px;
  font-weight: bold;
`;

const RightButton = styled(Button)`
  display: flex;
`;

const StyledTable = styled.div`
  margin-top: 10px;
`;

const StyledMenuContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const StyledRow = styled(Table.Row)`
  height: 45px !important;
`;

const StyledCell = styled(Table.Cell)`
  height: 45px !important;
  padding: 5px !important;
  align-items: center;
`;
