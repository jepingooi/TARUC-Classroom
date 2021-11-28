import { Container, Col, Row, Form, Button, Alert } from "react-bootstrap";
import {
  collection,
  addDoc,
  Timestamp,
  getFirestore,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useContext, useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import classes from "./NewSurvey.module.css";
import NewQuestion from "../components/NewQuestion";
import PrimaryButton from "../../../components/AddItemButton";
import AuthContext from "../../../store/auth-context";
import CustomModal from "../../../components/CustomModal";

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
  const [showSuccess, setShowSuccess] = useState(false);

  const { user } = authContext;

  const handleClose = () => {
    setShowSuccess(false);
    history.goBack();
  };

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
    const newQuestions = JSON.parse(JSON.stringify(questions));
    for (const q of newQuestions) {
      if (q.type !== "Paragraph") {
        for (const index of q.options.keys()) {
          q.options[index] = { option: q.options[index], answers: 0 };
        }
      }
    }

    await addDoc(collection(db, "surveys"), {
      createdDate: Timestamp.fromDate(new Date()),
      owner: user.email,
      questions: newQuestions,
      status: "Drafted",
      title,
      responses: 0,
    });

    setShowSuccess(true);
  };

  useEffect(async () => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [questions]);

  return (
    <Container className="mt-4">
      <CustomModal
        show={showSuccess}
        isSuccess={true}
        onHide={handleClose}
        title="Success"
      >
        Your survey has been created successfully!
      </CustomModal>

      <Fragment>
        <Row className="justify-content-center align-items-center position-sticky">
          <Col md={6}>
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
          <Col md={3} className="text-end">
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
            <Row
              key={index}
              className={`${
                index == 0 ? "mt-3" : "mt-4"
              } justify-content-center`}
            >
              <Col md={9}>
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
    </Container>
  );
};

export default NewSurvey;
