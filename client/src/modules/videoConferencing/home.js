import React, { Component } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button, Table, Menu, Icon } from "semantic-ui-react";
import { ToastContainer, toast } from "react-toastify";

// Modals
import SettingModal from "./settingModal";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, onSnapshot, query, where } from "firebase/firestore";

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
  participantIdList: [],
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
      loginUser: this.props.loginUser,
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
    let userRef = collection(db, "users");
    let userQuerySnapshot = await getDocs(userRef);
    userQuerySnapshot.forEach((doc) => {
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

  // Sort room (owner room - joined room)
  sortRoom = () => {
    let tempRoomList = [];
    let participantRoom = [];

    if (this.state.roomList) {
      // eslint-disable-next-line
      this.state.roomList.map((eachRoom) => {
        if (eachRoom.status === "active") {
          if (eachRoom.ownerId === this.props.loginUser.email) {
            tempRoomList.push(eachRoom);
          } else if (eachRoom.participantIdList.includes(this.props.loginUser.email)) {
            participantRoom.push(eachRoom);
          }
        }
      });
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
                {eachRoom.participantIdList ? eachRoom.participantIdList.length + 1 : 0 + 1}
              </StyledCell>
              <StyledCell style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                {eachRoom.ownerId === this.props.loginUser.email && (
                  <Button
                    onClick={() => {
                      this.handleModal(true, eachRoom, "edit");
                    }}
                    icon="edit"
                    basic
                  />
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
  generatePagination = () => {
    let collectedPagination = [];
    let tempNum = Math.floor(this.state.roomList?.length / 10);

    for (let i = 0; i <= tempNum; i++) {
      collectedPagination.push(
        <Menu.Item key={i + 1} as="a" onClick={() => this.paging(i + 1)}>
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

    this.setState({ settingModal: status, selectedRoom: room, action: action });
  };

  // Pagination for room list table
  renderPagination = () => {
    if (this.state.roomList?.length > 10)
      return (
        <StyledMenuContainer>
          <Menu pagination>
            {this.state.page > 1 && (
              <Menu.Item as="a" icon onClick={() => this.paging("back")}>
                <Icon name="chevron left" />
              </Menu.Item>
            )}

            {this.generatePagination()}

            {this.state.page <= Math.floor(this.state.roomList.length / 10) && (
              <Menu.Item as="a" icon onClick={() => this.paging("next")}>
                <Icon name="chevron right" />
              </Menu.Item>
            )}
          </Menu>
        </StyledMenuContainer>
      );
  };

  // Room list table
  renderBottomTable = () => {
    let tempRoom = this.sortRoom();

    if (tempRoom.length > 0) {
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

            <Table.Body>{this.generateRoomList(tempRoom)}</Table.Body>
          </Table>
        </StyledTable>
      );
    } else return <div style={{ display: "flex", justifyContent: "center", marginTop: "50px" }}>No room found.</div>;
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
    return (
      <StyledContent>
        <ToastContainer position="bottom-right" closeOnClick newestOnTop={false} pauseOnHover />
        {this.renderRoomSettingModal()}
        <StyledSubContent>
          {this.renderTopSide()}
          {this.renderBottomTable()}
        </StyledSubContent>
        {this.renderPagination()}
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
  margin-top: 20px;
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
  margin-top: 20px;
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
