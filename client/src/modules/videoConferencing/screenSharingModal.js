import React, { useRef, useEffect } from "react";
import { Button, Modal } from "semantic-ui-react";
import io from "socket.io-client";
import Peer from "simple-peer";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

const ScreenSharingModal = (props) => {
  const socketRef = useRef();
  const selectedRoom = props.selectedRoom;
  const loginUser = props.loginUser;
  const peersRef = useRef([]);

  useEffect(() => {
    if (props.screenSharing) return () => toggleScreenSharing(); // eslint-disable-next-line
  }, []);

  function createStream() {
    socketRef.current = io.connect("/");

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }).then((stream) => {
      props.joinRoom(true);
      updateShareScreenStatusInFirebase(!props.screenSharing);
      props.handleScreenSharing(!props.screenSharing); // Set screen sharing status

      socketRef.current.emit("join room", selectedRoom.id, `shareScreen_${loginUser.email}`);

      socketRef.current.on("all users", (users) => {
        users.forEach((user) => {
          const peer = createPeer(user.socketID, socketRef.current.id, stream);
          peersRef.current.push({ userID: user.userID, peerID: user.socketID, peer });
        });
      });

      socketRef.current.on("user joined", (payload) => {
        const peer = addPeer(payload.signal, payload.callerID, stream);
        peersRef.current.push({ userID: payload.userID, peerID: payload.callerID, peer });
      });

      socketRef.current.on("user left", (id) => {
        const peerObj = peersRef.current.find((p) => p.peerID === id);
        if (peerObj) peerObj.peer.destroy();
        const tempPeers = peersRef.current.filter((p) => p.peerID !== id);
        peersRef.current = tempPeers;
      });

      socketRef.current.on("receiving returned signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });
    });
  }

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    let roomID = selectedRoom.id;

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", { userToSignal, callerID, signal, roomID });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);
    return peer;
  }

  async function updateShareScreenStatusInFirebase(status) {
    let onlineUserList = Object.assign([], selectedRoom.participantInRoomList);

    // eslint-disable-next-line
    onlineUserList.map((eachUser) => {
      if (eachUser.id === loginUser.email) {
        eachUser.shareScreen = status;
      }
    });

    let roomRef = doc(db, "videoConferencingRooms", selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: onlineUserList });
  }

  // Remove share screen user in firebase
  async function updateShareScreenUserFirebase() {
    let tempParticipantInRoomList = [];
    let participantInRoomList = selectedRoom.participantInRoomList;

    // eslint-disable-next-line
    participantInRoomList.map((eachParticipant) => {
      if (eachParticipant.id !== `shareScreen_${loginUser.email}`) tempParticipantInRoomList.push(eachParticipant);
    });

    let roomRef = doc(db, "videoConferencingRooms", selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: tempParticipantInRoomList });
  }

  function toggleScreenSharing() {
    if (props.screenSharing) {
      // Stop sharing
      socketRef.current.disconnect();
      updateShareScreenUserFirebase();
      updateShareScreenStatusInFirebase(!props.screenSharing);
      props.handleScreenSharing(!props.screenSharing); // Set screen sharing status
    } else {
      // Start sharing
      createStream();
    }

    props.setScreenSharingModal(); // Close modal
  }

  return (
    <Modal closeIcon open={props.screenSharingModal} size={"tiny"} onClose={() => props.setScreenSharingModal()}>
      <Modal.Header>{props.screenSharing ? "Stop " : "Start"} sharing your screen?</Modal.Header>
      <Modal.Actions>
        <Button negative onClick={() => props.setScreenSharingModal()}>
          Cancel
        </Button>
        <Button positive onClick={() => toggleScreenSharing()}>
          Confirm
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ScreenSharingModal;
