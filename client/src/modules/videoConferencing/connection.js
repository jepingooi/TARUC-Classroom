import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Button, Icon, Modal } from "semantic-ui-react";
import io from "socket.io-client";
import Peer from "simple-peer";

// Firebase
import { firebaseConfig } from "../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, doc } from "firebase/firestore";

initializeApp(firebaseConfig);
const db = getFirestore();

const FunctionButtons = (props) => {
  const selectedRoom = props.selectedRoom;
  const loginUser = props.loginUser;

  useEffect(() => {
    return () => handleHangUp();
  }, []);

  function handleHangUp() {
    props.socketRef.current.disconnect();
    props.handleModal("hangUpModal", true);
  }

  let tempUser = {};
  // eslint-disable-next-line
  selectedRoom.participantInRoomList.map((eachParticipant) => {
    if (eachParticipant.id === loginUser.email) {
      tempUser = eachParticipant;

      if (eachParticipant.id === selectedRoom.ownerId) tempUser.owner = true;
      else tempUser.owner = false;
    }
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

        {(selectedRoom.mic || tempUser.owner) && (
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
            onClick={() => props.handleModal("shareScreenModal", true)}
            icon={"laptop"}
            size="massive"
            circular
            color={tempUser.shareScreen ? "green" : "grey"}
          />
        )}

        <Button onClick={() => handleHangUp()} icon="shutdown" size="massive" circular color={"grey"} />
      </Button.Group>
    </div>
  );
};

const Video = (props) => {
  const ref = useRef();

  useEffect(() => {
    props.peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
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

  useEffect(() => {
    socketRef.current = io.connect("/");
    createStream();
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
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({ userID: payload.userID, peerID: payload.callerID, peer });
          const peerObj = { userID: payload.userID, peerID: payload.callerID, peer };

          setPeers((users) => [...users, peerObj]);
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

  return (
    <MainScreenContainer>
      {renderMicModal()}
      {renderCameraModal()}
      <ParticipantScreenContainer>
        <ParticipantContainer key={loginUser.email}>
          <ScreenContainer>
            <video muted ref={userVideoRef} autoPlay playsInline style={{ maxHeight: "100%" }} />
          </ScreenContainer>
          <ParticipantDetailContainer>
            <div>{loginUser.name}</div>
            <div>
              {videoFlag && <Icon name="video camera" size="large" style={{ marginRight: "10px" }} />}
              {!audioFlag && <Icon name="microphone slash" size="large" style={{ marginRight: "10px" }} />}
            </div>
          </ParticipantDetailContainer>
        </ParticipantContainer>
        {selectedRoom.participantInRoomList.map((eachUser) => {
          let tempPeer;

          peers.map((eachPeer) => {
            if (eachPeer.userID === eachUser.id) {
              tempPeer = eachPeer;
            }
          });

          if (tempPeer) {
            // Check audio and video status
            let audioFlagTemp = true;
            let videoFlagTemp = true;
            if (userUpdate) {
              userUpdate.forEach((entry) => {
                if (tempPeer.peerID && tempPeer.peerID === entry.id) {
                  audioFlagTemp = entry.audioFlag;
                  videoFlagTemp = entry.videoFlag;
                }
              });
            }

            // Collect all screen
            return (
              // <ParticipantContainer key={peer.peerID} onClick={() => this.handleScreen("focus", eachUser)}>
              <ParticipantContainer key={eachUser.id}>
                <ScreenContainer>
                  <Video peer={tempPeer.peer} />
                </ScreenContainer>
                <ParticipantDetailContainer>
                  <div>{eachUser.name}</div>
                  <div>
                    {videoFlagTemp && <Icon name="video camera" size="large" style={{ marginRight: "10px" }} />}
                    {audioFlagTemp && <Icon name="microphone slash" size="large" style={{ marginRight: "10px" }} />}
                  </div>
                </ParticipantDetailContainer>
              </ParticipantContainer>
            );
          }
        })}
      </ParticipantScreenContainer>
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
        socketRef={socketRef}
        setMicModal={() => setMicModal(true)}
        setCameraModal={() => setCameraModal(true)}
      />
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
  margin: 0px 15px;
  padding: 20px 10px;

  :hover {
    cursor: pointer;
  }
`;

const ScreenContainer = styled.div`
  width: 100%;
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ParticipantDetailContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 15%;
  width: 100%;
  align-items: flex-end;
  justify-content: space-between;
`;

const ParticipantContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
`;
