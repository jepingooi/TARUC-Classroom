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
import Buttons from "../../../components/Buttons";
import classes from "./NewSurvey.module.css";
import NewQuestion from "../components/NewQuestion";
import PrimaryButton from "../../../components/AddItemButton";

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

const INITIAL_QUESTIONS = {
  isRequired: false,
  question: "",
  type: "Paragraph",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NewSurvey = (props) => {
  const [questions, setQuestions] = useState([INITIAL_QUESTIONS]);

  const addQuestionHandler = () => {};

  return (
    <Container className="mt-2">
      <Form className="pt-3">
        <Row className="align-items-center position-sticky">
          <Col md={3}>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Survey Title"
              className={classes.title}
            />
          </Col>
          <Col className="text-end">
            <Buttons isDefault={true} primary="Save" secondary="Cancel" />
          </Col>
        </Row>
        {questions.map((question) => {
          console.log(question);
          return (
            <Row className="mt-3">
              <Col>
                <NewQuestion question={question} />
              </Col>
            </Row>
          );
        })}
        <Row className="mt-5">
          <Col className="text-center">
            <PrimaryButton onClick={addQuestionHandler}>
              Add Question
            </PrimaryButton>
          </Col>
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
