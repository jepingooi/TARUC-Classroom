import { Container, Col, Row, Button, Form } from "react-bootstrap";
import {
  collection,
  addDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import classes from "./NewSurvey.module.css";
import NewQuestion from "../components/NewQuestion";
import PrimaryButton from "../../../components/AddItemButton";
import AuthContext from "../../../store/auth-context";
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

const BASE_QUESTION = {
  id: 0,
  isRequired: false,
  question: "",
  type: "Paragraph",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NewSurvey = (props) => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const [questions, setQuestions] = useState([BASE_QUESTION]);
  const [title, setTitle] = useState("");
  const { user } = authContext;
  const handleCancel = () => {
    history.goBack();
  };
  const handleSave = async (e) => {
    //TODO - WRITE UPLOAD TO DB LOGIC HERE!!!!!!!!!!!!!!!!!!!!!!
    e.preventDefault();

    await addDoc(collection(db, "surveys"), {
      createdDate: Timestamp.fromDate(new Date()),
      owner: user.email,
      questions,
      status: "Drafted",
      title,
      responses: [],
    });

    console.log("Survey saved");
  };

  const handleAddQuestion = () => {
    setQuestions((prevState) => {
      return [...prevState, { ...BASE_QUESTION, id: prevState.length + 1 }];
    });
  };

  const handleQuestionChange = (q) => {
    const index = questions.map((e) => e.id).indexOf(q.id);
    setQuestions((prevState) => {
      return (prevState[index] = q);
    });
  };

  const handleDeleteQuestion = (deleteQuestion) => {
    setQuestions((prevState) => {
      for (const q of questions) {
        console.log(q);
      }
      return prevState.filter((question) => {
        return question !== deleteQuestion;
      });
    });
  };

  return (
    <Container className="mt-4">
      <Row className="align-items-center position-sticky">
        <Col md={3}>
          <Form.Control
            size="lg"
            type="text"
            placeholder="Survey Title"
            className={classes.title}
            onBlur={(e) => {
              setTitle(e.target.value);
            }}
          />
        </Col>
        <Col className="text-end">
          <Buttons
            isDefault={true}
            primary="Save"
            secondary="Cancel"
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </Col>
      </Row>
      {questions.map((question, index) => {
        return (
          <Row key={index} className={`${index == 0 ? "mt-3" : "mt-4"}`}>
            <Col>
              <NewQuestion
                onChange={handleQuestionChange}
                question={question}
                onDelete={handleDeleteQuestion.bind(null, question)}
              />
            </Col>
          </Row>
        );
      })}
      <Row>
        <Col className="text-center my-5">
          <PrimaryButton onClick={handleAddQuestion}>
            Add Question
          </PrimaryButton>
        </Col>
      </Row>
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
