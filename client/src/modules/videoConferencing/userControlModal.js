import React from "react";
import { Button, Modal } from "semantic-ui-react";
import styled from "styled-components";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

const UserControlModal = (props) => {
  async function toggleUserMuteInFirebase() {
    let invitedParticipantList = Object.assign([], props.selectedRoom.invitedParticipantList);

    invitedParticipantList.forEach((user) => {
      if (user.id === props.selectedUser.id) user.muted = !props.selectedUser.muted;
    });

    let roomRef = doc(db, "videoConferencingRooms", props.selectedRoom.id);
    await updateDoc(roomRef, { invitedParticipantList: invitedParticipantList });
    props.handleModal();
  }

  async function kickUser() {
    let newList = [];
    props.selectedRoom.participantInRoomList.forEach((user) => {
      if (user.id !== props.selectedUser.id) newList.push(user);
    });

    let roomRef = doc(db, "videoConferencingRooms", props.selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: newList });
    props.handleModal();
  }

  function renderSetting() {
    return (
      <UserControlContainer>
        <StyledButton onClick={() => toggleUserMuteInFirebase()}>
          {props.selectedUser.muted ? "Unmute" : "Mute"}
        </StyledButton>
        <StyledButton onClick={() => kickUser()}>Kick</StyledButton>
        <StyledButton onClick={() => props.handleModal()}>Cancel</StyledButton>
      </UserControlContainer>
    );
  }

  return (
    <Modal closeIcon open={props.userControlModal} size={"tiny"} onClose={() => props.handleModal()}>
      <Modal.Description>{renderSetting()}</Modal.Description>
    </Modal>
  );
};

export default UserControlModal;

const UserControlContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledButton = styled(Button)`
  margin-top: 30px;
`;
