import React, { createRef, useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import styled from "styled-components";
import { Button, Icon } from "semantic-ui-react";

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
  const videoConstraints = {
    minAspectRatio: 1.333,
    minFrameRate: 60,
    height: window.innerHeight / 1.8,
    width: window.innerWidth / 2,
  };

  useEffect(() => {
    socketRef.current = io.connect("/");
    createStream();
  }, []);

  function createStream() {
    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: true }).then((stream) => {
      userVideoRef.current.srcObject = stream;
      socketRef.current.emit("join room", selectedRoom.id, loginUser.email);

      // props.setButton("toggleMicButton", toggleMicButton);
      // props.setButton("toggleVideoButton", toggleVideoButton);

      socketRef.current.on("all users", (users) => {
        const peers = [];
        users.forEach((user) => {
          const peer = createPeer(user.socketID, socketRef.current.id, stream);
          peersRef.current.push({ userID: user.userID, peerID: user.socketID, peer });
          peers.push({ userID: user.userID, peerID: user.socketID, peer });
        });
        setPeers(peers);
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
        const peers = peersRef.current.filter((p) => p.peerID !== id);
        peersRef.current = peers;
        setPeers(peers);
      });

      socketRef.current.on("receiving returned signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerID === payload.id);
        item.peer.signal(payload.signal);
      });

      socketRef.current.on("change", (payload) => setUserUpdate(payload));
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

  const toggleMicButton = () => {
    return (
      <Button
        icon={audioFlag ? "microphone" : "microphone slash"}
        size="massive"
        circular
        color={audioFlag ? "green" : "grey"}
        onClick={() => {
          if (userVideoRef.current.srcObject) {
            userVideoRef.current.srcObject.getTracks().forEach(function (track) {
              if (track.kind === "audio") {
                if (track.enabled) {
                  socketRef.current.emit("change", [
                    ...userUpdate,
                    {
                      id: socketRef.current.id,
                      videoFlag,
                      audioFlag: false,
                    },
                  ]);
                  track.enabled = false;
                  setAudioFlag(false);
                } else {
                  socketRef.current.emit("change", [
                    ...userUpdate,
                    {
                      id: socketRef.current.id,
                      videoFlag,
                      audioFlag: true,
                    },
                  ]);
                  track.enabled = true;
                  setAudioFlag(true);
                }
              }
            });
          }
        }}
      />
    );
  };

  const toggleVideoButton = () => {
    return (
      <Button
        icon={"video camera"}
        size="massive"
        circular
        color={videoFlag ? "green" : "grey"}
        onClick={() => {
          if (userVideoRef.current.srcObject) {
            userVideoRef.current.srcObject.getTracks().forEach(function (track) {
              if (track.kind === "video") {
                if (track.enabled) {
                  socketRef.current.emit("change", [
                    ...userUpdate,
                    {
                      id: socketRef.current.id,
                      videoFlag: false,
                      audioFlag,
                    },
                  ]);
                  track.enabled = false;
                  setVideoFlag(false);
                } else {
                  socketRef.current.emit("change", [
                    ...userUpdate,
                    {
                      id: socketRef.current.id,
                      videoFlag: true,
                      audioFlag,
                    },
                  ]);
                  track.enabled = true;
                  setVideoFlag(true);
                }
              }
            });
          }
        }}
      />
    );
  };

  // const generateParticipantScreen = () => {
  //   // Push login user screen first
  //   let tempParticipantScreen = [];
  //   tempParticipantScreen.push();

  //   // Push the rest of user

  //   // // Arrange the users into 3/row
  //   // let collectedParticipantScreen = [];
  //   // let tempCollectedParticipantScreen = [];
  //   // tempParticipantScreen.map((eachScreen, i) => {
  //   //   tempCollectedParticipantScreen.push(eachScreen);

  //   //   if ((i + 1) % 3 === 0 || i + 1 === tempParticipantScreen.length || i === tempParticipantScreen.length) {
  //   //     collectedParticipantScreen.push(
  //   //       <ParticipantContainerRow key={`row${i / 2}`}>{tempCollectedParticipantScreen}</ParticipantContainerRow>
  //   //     );
  //   //     tempCollectedParticipantScreen = [];
  //   //   }
  //   // });

  //   return tempParticipantScreen;
  // };

  return (
    <MainScreenContainer>
      {/* <div style={{ overflowY: "auto" }}>{generateParticipantScreen()}</div> */}
      <ParticipantContainer key={loginUser.email}>
        <ScreenContainer>
          <video muted ref={userVideoRef} autoPlay playsInline style={{ maxHeight: "100%" }} />
        </ScreenContainer>
        <ParticipantDetailContainer>
          <div>{loginUser.name}</div>
          <div>
            {videoFlag && <Icon name="video camera" size="large" style={{ marginRight: "10px" }} />}
            {!audioFlag && <Icon name="microphone slash" size="large" style={{ marginRight: "10px" }} />}
            {/* {eachUser.shareScreen && sharingScreenIcon}
              {eachUser.raiseHand && raiseHandIcon} */}
          </div>
        </ParticipantDetailContainer>
      </ParticipantContainer>
      {peers.map((peer) => {
        // Check audio and video status
        let audioFlagTemp = false;
        let videoFlagTemp = false;
        if (userUpdate) {
          userUpdate.forEach((entry) => {
            if (peer?.peerID && peer?.peerID === entry.id) {
              audioFlagTemp = entry.audioFlag;
              videoFlagTemp = entry.videoFlag;
            }
          });
        }

        // Get user name
        let name = "";
        let id = "";
        selectedRoom.participantInRoomList.map((eachParticipant) => {
          if (eachParticipant.id === peer.userID) {
            name = eachParticipant.name;
            id = eachParticipant.id;
          }
        });

        // Collect all screen
        return (
          // <ParticipantContainer key={peer.peerID} onClick={() => this.handleScreen("focus", eachUser)}>
          <ParticipantContainer key={id}>
            <ScreenContainer>
              <Video peer={peer.peer} />
            </ScreenContainer>
            <ParticipantDetailContainer>
              <div>{name}</div>
              <div>
                {videoFlagTemp && <Icon name="video camera" size="large" style={{ marginRight: "10px" }} />}
                {audioFlagTemp && <Icon name="microphone slash" size="large" style={{ marginRight: "10px" }} />}
                {/* {eachUser.shareScreen && sharingScreenIcon}
                {eachUser.raiseHand && raiseHandIcon} */}
              </div>
            </ParticipantDetailContainer>
          </ParticipantContainer>
        );
      })}
    </MainScreenContainer>
  );
};

export default Room;

const MainScreenContainer = styled.div`
  margin: 30px 30px 0px;
  width: calc(100vw - 60px - 240px);
  height: calc(100% - 140px);
  border: 1px black solid;
  display: flex;
  flex-direction: row;
  overflow-y: auto;
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
