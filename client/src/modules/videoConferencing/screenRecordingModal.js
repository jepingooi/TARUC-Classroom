import React, { useState, useEffect } from "react";
import { Button, Modal } from "semantic-ui-react";
import styled from "styled-components";
import { useReactMediaRecorder } from "react-media-recorder";
import emailjs, { init } from "emailjs-com";

// // Firebase
// import { firebaseConfig } from "../../firebaseConfig.json";
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDoc, getDocs, updateDoc, doc } from "firebase/firestore";
// import { getStorage, ref, uploadBytes, getDownloadURL, uploadBytesResumable } from "firebase/storage";

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

  useEffect(() => {
    return () => stopRecord();
  }, []);

  function startRecording() {
    let today = new Date();
    let tempVideoId = `${props.selectedRoom.id}$${getRoomDate(today)}`;
    setVideoId(tempVideoId);

    props.handleModal(false);
    props.handleRecording(true);
    return startRecord();
  }

  function stopRecording() {
    props.handleRecording(false);
    return stopRecord();
  }

  // function uploadToFirebase() {
  //   const file = new File([mediaBlobUrl], `${mediaBlobUrl}.mp4`, {
  //     type: "mp4",
  //   });
  //   let storageRef = ref(storage, `recorded_videos/${videoId}.mp4`);

  //   uploadBytes(storageRef, mediaBlobUrl);
  //   // const uploadTask = uploadBytesResumable(storageRef, file);

  //   // uploadTask.on("state_changed", (snapshot) => {
  //   //   const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
  //   //   console.log("Upload is " + progress + "% done");
  //   //   switch (snapshot.state) {
  //   //     case "paused":
  //   //       console.log("Upload is paused");
  //   //       break;
  //   //     case "running":
  //   //       console.log("Upload is running");
  //   //       break;
  //   //   }
  //   //   if (progress === 100) {
  //   //     getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //   //       console.log("File available at", downloadURL);
  //   //     });
  //   //   }
  //   // });
  // }

  // Convert Date to string (DDMMYYYYHHMM)
  function getRoomDate(dateTime) {
    let date = `${dateTime.getDate()}${dateTime.getMonth() + 1}${dateTime.getFullYear()}`;
    let time = `${dateTime.getHours()}${("0" + dateTime.getMinutes()).slice(-2)}`;
    let result = date + time;
    return result;
  }

  function downloadRecording() {
    let pathName = `${videoId}.mp4`;
    let link = document.createElement("a");

    link.href = mediaBlobUrl;
    link.download = pathName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function mailRecording() {
    // uploadToFirebase();
    sendFeedback({
      name: props.loginUser.name,
      room_name: props.selectedRoom.name,
      reply_to: props.loginUser.email,
      message: mediaBlobUrl,
    });
  }

  function sendFeedback(variables) {
    emailjs
      .send(serviceId, templateId, variables)
      .then((res) => {
        console.log("Email successfully sent!");
      })
      .catch((err) => console.error("Oh well, you failed. Here some thoughts on the error that occured:", err));
  }

  function renderRecordedVideo() {
    return (
      <RecordedVideoContainer>
        <video src={mediaBlobUrl} controls autoPlay width={800} height={400} />;
      </RecordedVideoContainer>
    );
  }

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
          <Button positive onClick={() => startRecording()}>
            {mediaBlobUrl ? "Record again" : "Start recording"}
          </Button>
        )}

        {mediaBlobUrl && status && status === "stopped" && (
          <Button positive onClick={() => downloadRecording()}>
            Download recording
          </Button>
        )}

        {mediaBlobUrl && status && status === "stopped" && (
          <Button positive onClick={() => mailRecording()}>
            Send this recording to your email
          </Button>
        )}

        {status && status === "recording" && (
          <Button positive onClick={() => stopRecording()}>
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
