import { Container, Col, Row, Form, Button, Alert } from "react-bootstrap";
import {
  collection,
  addDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useContext, Fragment } from "react";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import classes from "./NewSurvey.module.css";
import NewQuestion from "../components/NewQuestion";
import PrimaryButton from "../../../components/AddItemButton";
import AuthContext from "../../../store/auth-context";

const BASE_QUESTION = {
  id: 0,
  isRequired: false,
  question: "",
  type: "Paragraph",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const NewSurvey = () => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const [questions, setQuestions] = useState([BASE_QUESTION]);
  const [title, setTitle] = useState("New Survey");
  const [show, setShow] = useState(false);
  const { user } = authContext;

  const handleCancel = () => {
    history.goBack();
  };

  const handleAddQuestion = () => {
    setQuestions((prevState) => {
      return [...prevState, { ...BASE_QUESTION, id: prevState.length }];
    });
  };

  const handleQuestionChange = (id, question) => {
    setQuestions((prevState) => {
      const newQuestions = prevState.filter((q) => {
        return q.id != id;
      });

      if (question.type == "Paragraph") {
        question = { ...question, answers: [] };
      }

      return [...newQuestions, question];
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

  const handleSave = async (e) => {
    e.preventDefault();

    for (const q of questions) {
      if (q.type !== "Paragraph") {
        for (const index of q.options.keys()) {
          q.options[index] = { option: q.options[index], answers: 0 };
        }
      }
    }
    await addDoc(collection(db, "surveys"), {
      createdDate: Timestamp.fromDate(new Date()),
      owner: user.email,
      questions,
      status: "Drafted",
      title,
      responses: [],
    });

    setShow(true);
  };

  return (
    <Container className="mt-4">
      <Alert show={show} variant="success">
        <Alert.Heading>Success</Alert.Heading>
        <p>Your survey has been created successfully!</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => history.goBack()} variant="outline-success">
            Done
          </Button>
        </div>
      </Alert>

      {!show && (
        <Fragment>
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
        </Fragment>
      )}
    </Container>
  );
};

export default NewSurvey;
