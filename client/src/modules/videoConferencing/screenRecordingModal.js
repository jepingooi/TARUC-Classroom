import React, { useState, useEffect } from "react";
import { Button, Modal } from "semantic-ui-react";
import styled from "styled-components";
import { useReactMediaRecorder } from "react-media-recorder";
// import emailjs, { init } from "emailjs-com";
import { toast } from "react-toastify";

// Firebase
// import { firebaseConfig } from "../../firebaseConfig.json";
// import { initializeApp } from "firebase/app";
// import { getFirestore, updateDoc, doc } from "firebase/firestore";
// import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";

// initializeApp(firebaseConfig);
// const db = getFirestore();
// const storage = getStorage();

// const templateId = "template_njyqjpe";
// const serviceId = "service_2j0wuvr";
// init("user_sX4pbznpHOIlHhAofPGDe");

// const email = "ngwl-pm18@student.tarc.edu.my";

const ScreenRecordingModal = (props) => {
  const [videoId, setVideoId] = useState("");
  // const [alreadyMail, setAlreadyMail] = useState(false);
  const {
    status,
    startRecording: startRecord,
    stopRecording: stopRecord,
    mediaBlobUrl,
  } = useReactMediaRecorder({ screen: true, mimeType: "video/mp4" });

  useEffect(() => {
    return () => stopRecording(); // eslint-disable-next-line
  }, []);

  async function startRecording() {
    // setAlreadyMail(false);
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

  // async function mailRecording() {
  //   setAlreadyMail(true);
  //   let file = new File([mediaBlobUrl], `${videoId}.mp4`, { type: "video/mp4", lastModified: Date.now() });

  //   // Upload to firebase storage
  //   let storageRef = ref(storage, `recorded_videos/${videoId}.mp4`);
  //   const uploadTask = uploadBytesResumable(storageRef, file);
  //   uploadTask.on("state_changed", (snapshot) => {
  //     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

  //     if (progress === 100) {
  //       getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //         sendFeedback({
  //           name: props.loginUser.name,
  //           email: email,
  //           room_name: props.selectedRoom.roomName,
  //           reply_to: props.loginUser.email,
  //           message: downloadURL,
  //         });
  //       });
  //     }
  //   });

  //   // Update room data in firebase
  //   let recordingList = props.selectedRoom.recordingIdList;
  //   recordingList.push(videoId);

  //   let roomRef = doc(db, "videoConferencingRooms", props.selectedRoom.id);
  //   await updateDoc(roomRef, { recordingIdList: recordingList });
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
    toast(`Successfully download recorded video.`);
  }

  // function sendFeedback(variables) {
  //   emailjs.send(serviceId, templateId, variables).then((res) => {
  //     // console.log("Email successfully sent!");
  //     toast(`Email successfully sent!`);
  //   });
  //   // .catch((err) => console.error("Oh well, you failed. Here some thoughts on the error that occured:", err));
  // }

  function renderRecordedVideo() {
    return (
      <RecordedVideoContainer>
        <video src={mediaBlobUrl} controls autoPlay width={800} height={400} />;
      </RecordedVideoContainer>
    );
  }

  return (
    <Modal
      closeIcon
      open={props.recordingModal}
      onClose={() => props.handleModal(false)}
      size={mediaBlobUrl ? "large" : "tiny"}
    >
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

        {/* {mediaBlobUrl && status && status === "stopped" && !alreadyMail && (
          <Button positive onClick={() => mailRecording()}>
            Send this recording to your email
          </Button>
        )} */}

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
