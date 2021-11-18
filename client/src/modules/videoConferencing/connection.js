import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Button, Modal } from "semantic-ui-react";
import io from "socket.io-client";
import Peer from "simple-peer";
import ScreenSharingModal from "./screenSharingModal";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

const FunctionButtons = (props) => {
  const selectedRoom = props.selectedRoom;
  const loginUser = props.loginUser;

  let tempUser = {};
  selectedRoom.participantInRoomList.forEach((eachParticipant) => {
    if (eachParticipant.id === loginUser.email) {
      tempUser = eachParticipant;

      if (eachParticipant.id === selectedRoom.ownerId) tempUser.owner = true;
      else tempUser.owner = false;
    }
  });

  let forceMuted = false;
  selectedRoom.invitedParticipantList.forEach((eachParticipant) => {
    if (eachParticipant.id === loginUser.email) forceMuted = eachParticipant.muted;
  });

  return (
    <div style={{ margin: "30px" }}>
      <Button.Group floated="right">
        {tempUser.owner && (
          <Button
            onClick={() => props.handleModal("settingModal", true, "edit")}
            icon="setting"
            size="massive"
            circular
            color={"grey"}
          />
        )}

        {(selectedRoom.pollIdList.length > 0 || tempUser.owner) && (
          <Button
            onClick={() => props.handleModal("pollModal", true)}
            icon="list ul"
            size="massive"
            circular
            color={"grey"}
          />
        )}

        {tempUser.owner && (
          <Button
            onClick={() => props.handleModal("recordingModal", true)}
            icon="film"
            size="massive"
            circular
            color={props.recording ? "green" : "grey"}
          />
        )}

        {selectedRoom.raiseHand && (
          <Button
            onClick={() => props.handleRaiseHand()}
            icon="hand paper"
            size="massive"
            circular
            color={tempUser.raiseHand ? "green" : "grey"}
          />
        )}

        {(selectedRoom.mic || tempUser.owner) && !forceMuted && (
          <Button
            icon={props.audioFlag ? "microphone" : "microphone slash"}
            size="massive"
            circular
            color={props.audioFlag ? "green" : "grey"}
            onClick={() => {
              props.audioFlag ? props.toggleMic() : props.setMicModal();
            }}
          />
        )}

        {(selectedRoom.camera || tempUser.owner) && (
          <Button
            icon={"video camera"}
            size="massive"
            circular
            color={props.videoFlag ? "green" : "grey"}
            onClick={() => {
              props.videoFlag ? props.toggleCamera() : props.setCameraModal();
            }}
          />
        )}

        {(selectedRoom.shareScreen || tempUser.owner) && (
          <Button
            icon="laptop"
            size="massive"
            circular
            color={props.screenSharing ? "green" : "grey"}
            onClick={() => props.setScreenSharingModal()}
          />
        )}

        <Button onClick={() => props.setHangupModal()} icon="shutdown" size="massive" circular color={"grey"} />
      </Button.Group>
    </div>
  );
};

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    }); // eslint-disable-next-line
  }, []);

  return <video playsInline autoPlay ref={ref} style={{ maxHeight: "100%" }} />;
};

const Room = (props) => {
  const [peers, setPeers] = useState([]);
  const [audioFlag, setAudioFlag] = useState(true);
  const [videoFlag, setVideoFlag] = useState(true);
  const [userUpdate, setUserUpdate] = useState([]);
  const socketRef = useRef();
  const userVideoRef = useRef();
  const peersRef = useRef([]);
  const selectedRoom = props.selectedRoom;
  const loginUser = props.loginUser;
  const [micModal, setMicModal] = useState(false);
  const [cameraModal, setCameraModal] = useState(false);
  const [screenSharingModal, setScreenSharingModal] = useState(false);
  const [hangupModal, setHangupModal] = useState(false);

  useEffect(() => {
    socketRef.current = io.connect("/");
    createStream();
    return () => socketRef.current.disconnect(); // eslint-disable-next-line
  }, []);

  function createStream() {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideoRef.current.srcObject = stream;
        socketRef.current.emit("join room", selectedRoom.id, loginUser.email);

        socketRef.current.on("all users", (users) => {
          const tempPeers = [];
          users.forEach((user) => {
            const peer = createPeer(user.socketID, socketRef.current.id, stream);
            peersRef.current.push({ userID: user.userID, peerID: user.socketID, peer });
            tempPeers.push({ userID: user.userID, peerID: user.socketID, peer });
          });
          setPeers(tempPeers);
        });

        socketRef.current.on("user joined", (payload) => {
          let exist = false;

          peersRef.current.forEach((peer) => {
            if (peer.userID === payload.userID) exist = true;
          });

          if (!exist) {
            const peer = addPeer(payload.signal, payload.callerID, stream, payload.type);
            peersRef.current.push({ userID: payload.userID, peerID: payload.callerID, peer });
            const peerObj = { userID: payload.userID, peerID: payload.callerID, peer };

            setPeers((users) => [...users, peerObj]);
          }
        });

        socketRef.current.on("user left", (id) => {
          const peerObj = peersRef.current.find((p) => p.peerID === id);
          if (peerObj) peerObj.peer.destroy();
          const tempPeers = peersRef.current.filter((p) => p.peerID !== id);
          peersRef.current = tempPeers;
          setPeers(tempPeers);
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          item.peer.signal(payload.signal);
        });

        socketRef.current.on("change", (payload) => setUserUpdate(payload));
      })
      .then(() => toggleMic())
      .then(() => toggleCamera());
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

  function toggleMic() {
    setMicModal(false);
    if (userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach(function (track) {
        if (track.kind === "audio") {
          let status = !track.enabled;
          socketRef.current.emit("change", [
            ...userUpdate,
            {
              id: socketRef.current.id,
              videoFlag,
              audioFlag: status,
            },
          ]);
          track.enabled = status;
          setAudioFlag(status);
          updateStatusInFirebase("mic", status);
        }
      });
    }
  }

  function toggleCamera() {
    setCameraModal(false);
    if (userVideoRef.current.srcObject) {
      userVideoRef.current.srcObject.getTracks().forEach(function (track) {
        if (track.kind === "video") {
          let status = !track.enabled;
          socketRef.current.emit("change", [
            ...userUpdate,
            {
              id: socketRef.current.id,
              videoFlag: status,
              audioFlag,
            },
          ]);
          track.enabled = status;
          setVideoFlag(status);
          updateStatusInFirebase("camera", status);
        }
      });
    }
  }

  async function updateStatusInFirebase(type, status) {
    let onlineUserList = Object.assign([], selectedRoom.participantInRoomList);

    // eslint-disable-next-line
    onlineUserList.map((eachUser) => {
      if (eachUser.id === loginUser.email) {
        eachUser[type] = status;
      }
    });

    let roomRef = doc(db, "videoConferencingRooms", selectedRoom.id);
    await updateDoc(roomRef, { participantInRoomList: onlineUserList });
  }

  // Hang up
  function handleHangUp() {
    props.handleHangUp();
    socketRef.current.disconnect();
    setHangupModal(false);
  }

  // Mic modal
  function renderMicModal() {
    return (
      <Modal closeIcon open={micModal} size={"tiny"} onClose={() => setMicModal(false)}>
        <Modal.Header>Turning on mic?</Modal.Header>
        <Modal.Actions>
          <Button negative onClick={() => setMicModal(false)}>
            Cancel
          </Button>
          <Button positive onClick={() => toggleMic()}>
            Confirm
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  // Camera modal
  function renderCameraModal() {
    return (
      <Modal closeIcon open={cameraModal} size={"tiny"} onClose={() => setCameraModal(false)}>
        <Modal.Header>Turning on camera?</Modal.Header>
        <Modal.Actions>
          <Button negative onClick={() => setCameraModal(false)}>
            Cancel
          </Button>
          <Button positive onClick={() => toggleCamera()}>
            Confirm
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  // Screen sharing modal
  function renderScreenSharingModal() {
    return (
      <ScreenSharingModal
        screenSharingModal={screenSharingModal}
        setScreenSharingModal={() => setScreenSharingModal(false)}
        screenSharing={props.screenSharing}
        handleScreenSharing={(status) => props.handleScreenSharing(status)}
        selectedRoom={selectedRoom}
        loginUser={loginUser}
        joinRoom={(screenSharing) => props.joinRoom(screenSharing)}
      />
    );
  }

  // Hang up modal
  function renderHangUpModal() {
    return (
      <Modal closeIcon open={hangupModal} size={"tiny"} onClose={() => setHangupModal(false)}>
        <Modal.Header>Hang up from this call?</Modal.Header>
        <Modal.Actions>
          <Button negative onClick={() => setHangupModal(false)}>
            Cancel
          </Button>
          <Button positive onClick={() => handleHangUp()}>
            Confirm
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }

  function renderFunctionButtons() {
    return (
      <FunctionButtons
        selectedRoom={selectedRoom}
        loginUser={loginUser}
        audioFlag={audioFlag}
        videoFlag={videoFlag}
        toggleMic={() => toggleMic()}
        toggleCamera={() => toggleCamera()}
        handleModal={(type, status, action) => props.handleModal(type, status, action)}
        handleRaiseHand={() => props.handleRaiseHand()}
        recording={props.recording}
        setMicModal={() => setMicModal(true)}
        setCameraModal={() => setCameraModal(true)}
        setScreenSharingModal={() => setScreenSharingModal(true)}
        screenSharing={props.screenSharing}
        setHangupModal={() => setHangupModal(true)}
      />
    );
  }

  function renderScreens() {
    let userScreen = <video muted ref={userVideoRef} autoPlay playsInline style={{ maxHeight: "100%" }} />;
    return (
      <ParticipantScreenContainer>
        <ParticipantContainer key={loginUser.email}>
          <ScreenContainer>{userScreen}</ScreenContainer>
          <ParticipantDetailContainer>{loginUser.name}</ParticipantDetailContainer>
        </ParticipantContainer>

        {selectedRoom.participantInRoomList.map((eachUser) => {
          let tempPeer;
          peers.forEach((eachPeer) => {
            if (eachPeer.userID === eachUser.id) {
              tempPeer = eachPeer;
            }
          });

          if (tempPeer) {
            return (
              <ParticipantContainer key={eachUser.id}>
                <ScreenContainer>
                  <Video peer={tempPeer.peer} />
                </ScreenContainer>
                <ParticipantDetailContainer>
                  <div>{eachUser.name}</div>
                </ParticipantDetailContainer>
              </ParticipantContainer>
            );
          }
        })}
      </ParticipantScreenContainer>
    );
  }

  return (
    <MainScreenContainer>
      {renderMicModal()}
      {renderCameraModal()}
      {renderScreenSharingModal()}
      {renderHangUpModal()}

      {renderScreens()}
      {renderFunctionButtons()}
    </MainScreenContainer>
  );
};

export default Room;

const ParticipantScreenContainer = styled.div`
  margin: 30px 30px 0px;
  width: calc(100vw - 60px - 240px);
  height: calc(100% - 140px);
  border: 1px black solid;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
  flex-wrap: wrap;
`;

const MainScreenContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: black;
`;

const ParticipantContainer = styled.div`
  width: calc((100% - 120px) / 3);
  height: 240px;
  background-color: #e0e1e2;
  border-radius: 20px;
  margin: 0px 15px 30px;
  padding: 20px 10px;

  :hover {
    cursor: pointer;
  }
`;

const ScreenContainer = styled.div`
  width: 100%;
  height: 93%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ParticipantDetailContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 13%;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
