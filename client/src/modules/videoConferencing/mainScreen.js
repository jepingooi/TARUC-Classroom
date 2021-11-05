import React, { Component, createRef } from "react";
import styled from "styled-components";
import { Icon } from "semantic-ui-react";

let sharingScreenIcon = <Icon name="laptop" size="large" />;
let cameraOnIcon = <Icon name="video camera" size="large" />;
let microphoneMutedIcon = <Icon name="microphone slash" size="large" />;
let raiseHandIcon = <Icon name="hand paper" size="large" />;

export default class mainScreen extends Component {
  constructor(props) {
    super(props);
    this.state = { type: "all" };
  }

  handleScreen = (type, participant) => {
    this.setState({ type: type, selectedParticipant: participant });
  };

  generateVideo = (user) => {
    if (user.ref) return <video playsInline autoPlay ref={user.ref} style={{ maxHeight: "100%" }} />;
    else if (user.peer) {
      let videoRef = createRef();
      user.peer.on("stream", (stream) => {
        videoRef.current.srcObject = stream;
      });
      return <video playsInline autoPlay ref={videoRef} style={{ maxHeight: "100%" }} />;
    }
  };

  filterUser = (participantList, loginUser, loginUserVideoRef, peers) => {
    let filteredList = [];

    participantList.map((eachParticipant) => {
      let userData = {
        id: eachParticipant.id,
        name: eachParticipant.name,
        shareScreen: eachParticipant.shareScreen,
        camera: eachParticipant.camera,
        mic: eachParticipant.mic,
        raiseHand: eachParticipant.raiseHand,
      };
      if (eachParticipant.id === loginUser.email) userData.ref = loginUserVideoRef;
      else {
        peers.map((eachPeer) => {
          if (eachPeer.userID === eachParticipant.id) {
            userData.peer = eachPeer.peer;
          }
        });
      }

      filteredList.push(userData);
    });

    return filteredList;
  };

  generateParticipantScreen = () => {
    let collectedParticipantScreen = [];

    if (this.props.selectedRoom?.participantInRoomList?.length > 0) {
      let participantList = this.props.selectedRoom.participantInRoomList;
      let list = this.filterUser(participantList, this.props.loginUser, this.props.userVideoRef, this.props.peers);
      let tempParticipantScreen = [];

      // eslint-disable-next-line
      list.map((eachUser, i) => {
        tempParticipantScreen.push(
          <ParticipantContainer key={`All${eachUser.id}`} onClick={() => this.handleScreen("focus", eachUser)}>
            <ScreenContainer>{this.generateVideo(eachUser)}</ScreenContainer>
            <ParticipantDetailContainer>
              <div>{eachUser.name}</div>
              <div>
                {eachUser.shareScreen && sharingScreenIcon}
                {eachUser.camera && cameraOnIcon}
                {!eachUser.mic && microphoneMutedIcon}
                {eachUser.raiseHand && raiseHandIcon}
              </div>
            </ParticipantDetailContainer>
          </ParticipantContainer>
        );

        if ((i + 1) % 3 === 0 || i + 1 === participantList.length || i === participantList.length) {
          collectedParticipantScreen.push(
            <ParticipantContainerRow key={`row${i / 2}`}>{tempParticipantScreen}</ParticipantContainerRow>
          );
          tempParticipantScreen = [];
        }
      });
    }

    return collectedParticipantScreen;
  };

  // generateParticipantSplit = () => {
  //   let collectedParticipantScreen = [];
  //   let loginUserScreen = [];
  //   let collectedScreen = [];
  //   let sharingScreenIcon = <Icon name="laptop" size="large" />;
  //   let cameraOnIcon = <Icon name="video camera" size="large" />;
  //   let microphoneMutedIcon = <Icon name="microphone slash" size="large" />;
  //   let raiseHandIcon = <Icon name="hand paper" size="large" />;

  //   if (this.props.selectedRoom?.participantInRoomList?.length > 0) {
  //     let participantList = this.props.selectedRoom.participantInRoomList;

  //     // eslint-disable-next-line
  //     participantList.map((eachParticipant, i) => {
  //       if (eachParticipant.id === this.state.selectedParticipant.id) return;

  //       if (eachParticipant.id === this.props.loginUser.email) {
  //         loginUserScreen.push(
  //           <SplitRightParticipant
  //             key={`LoginUser${eachParticipant.id}`}
  //             onClick={() => this.handleScreen("focus", eachParticipant)}
  //           >
  //             <ScreenContainer>{this.generateVideo()}</ScreenContainer>
  //             <ParticipantDetailContainer>
  //               <div>{eachParticipant.name}</div>
  //               <div>
  //                 {eachParticipant.shareScreen && sharingScreenIcon}
  //                 {eachParticipant.camera && cameraOnIcon}
  //                 {!eachParticipant.mic && microphoneMutedIcon}
  //                 {eachParticipant.raiseHand && raiseHandIcon}
  //               </div>
  //             </ParticipantDetailContainer>
  //           </SplitRightParticipant>
  //         );
  //       } else {
  //         collectedParticipantScreen.push(
  //           <SplitRightParticipant
  //             key={`Split${eachParticipant.id}`}
  //             onClick={() => this.handleScreen("focus", eachParticipant)}
  //           >
  //             <ScreenContainer>{this.generateVideo()}</ScreenContainer>
  //             <ParticipantDetailContainer>
  //               <div>{eachParticipant.name}</div>
  //               <div>
  //                 {eachParticipant.shareScreen && sharingScreenIcon}
  //                 {eachParticipant.camera && cameraOnIcon}
  //                 {!eachParticipant.mic && microphoneMutedIcon}
  //                 {eachParticipant.raiseHand && raiseHandIcon}
  //               </div>
  //             </ParticipantDetailContainer>
  //           </SplitRightParticipant>
  //         );
  //       }

  //       collectedScreen = loginUserScreen.concat(collectedParticipantScreen);
  //     });
  //   }

  //   return collectedScreen;
  // };

  renderAllScreen = () => {
    return <div style={{ overflowY: "auto" }}>{this.generateParticipantScreen()}</div>;
  };

  // renderFocusScreen = () => {
  //   return (
  //     <FocusContainer>
  //       <ParticipantFocusScreen onClick={() => this.handleScreen("all")}>
  //         <ScreenContainer style={{ height: "95%" }}>{this.generateVideo()}</ScreenContainer>
  //         <FocusParticipantDetailContainer>{this.state.selectedParticipant.name}</FocusParticipantDetailContainer>
  //       </ParticipantFocusScreen>
  //       <RightPanelContainer onClick={() => this.handleScreen("split", this.state.selectedParticipant)}>
  //         <Icon name="arrow alternate circle left outline" size="huge" />
  //       </RightPanelContainer>
  //     </FocusContainer>
  //   );
  // };

  // renderSplitScreen = () => {
  //   return (
  //     <SplitContainer>
  //       <SplitLeftContainer onClick={() => this.handleScreen("focus", this.state.selectedParticipant)}>
  //         <ScreenContainer>{this.generateVideo()}</ScreenContainer>
  //         <FocusParticipantDetailContainer>{this.state.selectedParticipant.name}</FocusParticipantDetailContainer>
  //       </SplitLeftContainer>
  //       <SplitRightContainer>{this.generateParticipantSplit()}</SplitRightContainer>
  //     </SplitContainer>
  //   );
  // };

  render = () => {
    if (this.state.type === "all") return this.renderAllScreen();
    else if (this.state.type === "focus") return this.renderFocusScreen();
    else if (this.state.type === "split") return this.renderSplitScreen();
  };
}

const ParticipantDetailContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 15%;
  width: 100%;
  align-items: flex-end;
  justify-content: space-between;
`;

const ScreenContainer = styled.div`
  width: 100%;
  height: 85%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

// All
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

const ParticipantContainerRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 30px;
`;

// Focus
const FocusContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

const FocusParticipantDetailContainer = styled.div`
  display: flex;
  width: 100%;
  height: 10%;
  align-items: flex-end;
  justify-content: space-between;
`;

const ParticipantFocusScreen = styled.div`
  width: calc(100vw - 370px);
  height: 100%;
  border-top-left-radius: 20px;
  border-bottom-left-radius: 20px;
  background-color: #e0e1e2;
  padding: 20px;
  display: flex;
  flex-direction: column;

  :hover {
    cursor: pointer;
  }
`;

const RightPanelContainer = styled.div`
  width: 70px;
  height: calc(100%);
  display: flex;
  align-items: center;
  background-color: #e0e1e2;
  justify-content: center;
  opacity: 0.8;

  :hover {
    cursor: pointer;
  }
`;

// Split
const SplitContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100%;
  width: 100%;
`;

const SplitLeftContainer = styled.div`
  display: flex;
  width: calc(100% - 270px);
  height: 100%;
  background-color: #e0e1e2;
  border-radius: 20px;
  align-items: flex-end;
  padding: 20px;
  flex-direction: column;

  :hover {
    cursor: pointer;
  }
`;

const SplitRightContainer = styled.div`
  width: 250px;
  height: 100%;
  margin-left: 20px;
  overflow-y: auto;
`;

const SplitRightParticipant = styled.div`
  display: flex;
  width: 100%;
  height: 200px;
  border-radius: 20px;
  background-color: #e0e1e2;
  padding: 20px 10px;
  margin-bottom: 20px;
  flex-direction: column;

  :hover {
    cursor: pointer;
  }
`;
