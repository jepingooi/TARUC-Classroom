import { Container, Col, Row, Button, Form } from "react-bootstrap";
import {
  collection,
  docRef,
  addDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState } from "react";
import Heading from "../../../components/Heading";
import Buttons from "../../../components/Buttons";

// const DUMMY_SURVEY = {
//   title: "New Survey!",
//   questions: [
//     {
//       question: "Do you like programming?",
//       isRequired: true,
//       type: "paragraph",
//     },
//   ],
//   startDate: Timestamp.fromDate(new Date()),
//   endDate: Timestamp.fromDate(new Date()),
// };

// const DUMMY_SURVEY_RESPONSE = {
//   student: "DQxxcLrncF0efqNlzO0g",
// };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NewSurvey = (props) => {
  const [questions, setQuestions] = useState({});

  return (
    <Container className="mt-2">
      <Form>
        <Row className="align-items-center">
          <Col md={3}>
            <Heading editable="true">Survey Title</Heading>
          </Col>
          <Buttons primary="Save" secondary="Cancel" />
        </Row>
      </Form>
    </Container>
  );
  // const transformSurvey = (survey) => {
  //   survey.answers = [];
  //   survey.status = "pending";
  //   survey.responses = [];
  //   createSurvey(survey);
  // };

  // const createSurvey = async (survey) => {
  //   const docRef = await addDoc(collection(db, "surveys"), survey);

  //   DUMMY_SURVEY_RESPONSE.survey = docRef;
  //   DUMMY_SURVEY_RESPONSE.status = "pending";

  //   await addDoc(collection(db, "responses"), DUMMY_SURVEY_RESPONSE);
  // };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   transformSurvey(DUMMY_SURVEY);
  // };
};

export default NewSurvey;
