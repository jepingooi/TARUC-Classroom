import { Container, Col, Row, Form } from "react-bootstrap";
import {
  collection,
  addDoc,
  Timestamp,
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useContext, useEffect, Fragment, useCallback } from "react";
import { useHistory, useLocation, useParams } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import classes from "./NewSurvey.module.css";
import NewQuestion from "../components/NewQuestion";
import PrimaryButton from "../../../components/AddItemButton";
import AuthContext from "../../../store/auth-context";
import CustomModal from "../../../components/CustomModal";
import Breadcrumbs from "../../../components/Breadcrumbs";
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
  const location = useLocation();
  const [questions, setQuestions] = useState([BASE_QUESTION]);
  const [title, setTitle] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const { user } = authContext;
  const { id } = useParams();
  console.log(questions);
  useEffect(async () => {
    if (location.pathname.endsWith("edit")) {
      const docRef = doc(db, "surveys", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setQuestions(docSnap.data().questions);
        setTitle(docSnap.data().title);
      } else {
        console.log("No such document!");
      }
    }
  }, []);

  const handleClose = () => {
    setShowSuccess(false);
    history.goBack();
  };

  const handleCancel = () => {
    history.replace("/surveys?filter=All");
  };

  const handleAddQuestion = () => {
    setQuestions((prevState) => {
      return [...prevState, { ...BASE_QUESTION, id: prevState.length }];
    });
    setQuestionCount((prevState) => {
      return prevState + 1;
    });
  };

  const updateQuestion = useCallback((question) => {
    setQuestions((prevState) => {
      const newQuestions = [...prevState];
      newQuestions[question.id] = question;
      return newQuestions;
    });
  }, []);

  const handleTypeChange = (question, type) => {
    question.type = type;
    updateQuestion(question);
  };

  const handleQuestionChange = (question, newQuestion) => {
    question.question = newQuestion;
    updateQuestion(question);
  };

  const handleRequireChange = (question, required) => {
    question.isRequired = required;
    updateQuestion(question);
  };

  const handleRemoveOption = (question, deleteOption) => {
    const newOptions = question.options.filter((option) => {
      return option != deleteOption;
    });
    question.options = newOptions;
    updateQuestion(question);
  };

  const handleAddOption = (question, newOption) => {
    let optionExists = false;
    if (question.options !== undefined) {
      question.options.map((option) => {
        if (option.option === newOption) {
          optionExists = true;
        }
      });
    } else {
      question.options = [];
    }

    if (newOption !== "" && !optionExists) {
      question.options.push({ option: newOption, answers: 0 });
    }
    updateQuestion(question);
  };

  const handleDeleteQuestion = (deleteQuestion) => {
    console.log(deleteQuestion);
    setQuestions((prevState) => {
      return prevState.filter((question) => {
        return question.id !== deleteQuestion.id;
      });
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const newQuestions = JSON.parse(JSON.stringify(questions));
    const { newOptions } = newQuestions;

    if (location.pathname.endsWith("edit")) {
      const surveyRef = doc(db, "surveys", id);
      await setDoc(
        surveyRef,
        { questions: newQuestions, title },
        { merge: true }
      );
    } else {
      await addDoc(collection(db, "surveys"), {
        createdDate: Timestamp.fromDate(new Date()),
        owner: user.email,
        questions: newQuestions,
        status: "Drafted",
        title: title || "New Survey",
        responses: 0,
      });
    }

    setShowSuccess(true);
  };

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [questionCount]);

  return (
    <Fragment>
      {/* {!user.isStudent && !location.pathname.endsWith("new") && (
        <Breadcrumbs id={id} active="edit" />
      )} */}

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
                defaultValue={location.pathname.endsWith("edit") ? title : ""}
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
                    key={index}
                    question={question}
                    onChange={handleQuestionChange}
                    onDelete={handleDeleteQuestion}
                    onTypeChange={handleTypeChange}
                    onRequireChange={handleRequireChange}
                    onAddOption={handleAddOption}
                    onRemoveOption={handleRemoveOption}
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
    </Fragment>
  );
};

export default NewSurvey;
