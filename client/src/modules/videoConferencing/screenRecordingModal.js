import React, { useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import styled from "styled-components";
import { useReactMediaRecorder } from "react-media-recorder";
import emailjs, { init } from "emailjs-com";

// // Firebase
// import { firebaseConfig } from "../../firebaseConfig.json";
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDoc, getDocs, updateDoc, doc } from "firebase/firestore";
// import { getStorage, ref, uploadBytes } from "firebase/storage";

// initializeApp(firebaseConfig);
// const db = getFirestore();
// const storage = getStorage();

const templateId = "template_njyqjpe";
const serviceId = "service_2j0wuvr";
init("user_sX4pbznpHOIlHhAofPGDe");

const ScreenRecordingModal = (props) => {
  const [videoId, setVideoId] = useState("");

  const {
    status,
    startRecording: startRecord,
    stopRecording: stopRecord,
    mediaBlobUrl,
  } = useReactMediaRecorder({ screen: true });

  const startRecording = () => {
    let today = new Date();
    let tempVideoId = `${props.selectedRoom.id}$${getRoomDate(today)}`;
    setVideoId(tempVideoId);

    props.handleModal(false);
    props.handleRecording(true);
    return startRecord();
  };

  const stopRecording = () => {
    props.handleRecording(false);
    return stopRecord();
  };

  // const uploadToFirebase = () => {
  //   console.log(mediaBlobUrl);
  //   let storageRef = ref(storage, `recorded_videos/${videoId}.mp4`);

  // uploadBytes(storageRef, mediaBlobUrl).then((snapshot) => {
  //   console.log(`Uploaded a blob ${videoId}!`);
  // });
  // };

  // Convert Date to string (DDMMYYYYHHMM)
  const getRoomDate = (dateTime) => {
    let date = `${dateTime.getDate()}${dateTime.getMonth() + 1}${dateTime.getFullYear()}`;
    let time = `${dateTime.getHours()}${("0" + dateTime.getMinutes()).slice(-2)}`;
    let result = date + time;
    return result;
  };

  const downloadRecording = () => {
    let pathName = `${videoId}.mp4`;
    let link = document.createElement("a");

    link.href = mediaBlobUrl;
    link.download = pathName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mailRecording = () => {
    sendFeedback({
      name: props.loginUser.name,
      room_name: props.selectedRoom.name,
      reply_to: props.loginUser.email,
      message: mediaBlobUrl,
    });
  };

  const sendFeedback = (variables) => {
    emailjs
      .send(serviceId, templateId, variables)
      .then((res) => {
        console.log("Email successfully sent!");
      })
      .catch((err) => console.error("Oh well, you failed. Here some thoughts on the error that occured:", err));
  };

  const renderRecordedVideo = () => {
    return (
      <RecordedVideoContainer>
        <video src={mediaBlobUrl} controls autoPlay width={800} height={400} />;
      </RecordedVideoContainer>
    );
  };

  return (
    <Modal closeIcon open={props.recordingModal} onClose={() => props.handleModal(false)}>
      <Modal.Header>Screen recording</Modal.Header>

      {mediaBlobUrl && (
        <Modal.Content scrolling>
          <Modal.Content>{renderRecordedVideo()}</Modal.Content>
        </Modal.Content>
      )}

      <Modal.Actions>
        {status && status !== "recording" && (
          <Button positive onClick={startRecording}>
            {mediaBlobUrl ? "Record again" : "Start recording"}
          </Button>
        )}

        {mediaBlobUrl && status && status === "stopped" && (
          <Button positive onClick={downloadRecording}>
            Download recording
          </Button>
        )}

        {mediaBlobUrl && status && status === "stopped" && (
          <Button positive onClick={mailRecording}>
            Send this recording to your email
          </Button>
        )}

        {status && status === "recording" && (
          <Button positive onClick={stopRecording}>
            Stop recording
          </Button>
        )}
        <Button negative onClick={() => props.handleModal(false)}>
          Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ScreenRecordingModal;

const RecordedVideoContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;
