import { Container, Col, Row, Button } from "react-bootstrap";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  collection,
  increment,
  setDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect, Fragment, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import { useParams } from "react-router";
import Heading from "../../../components/Heading";
import AnswerQuestion from "../components/AnswerQuestion";
import AuthContext from "../../../store/auth-context";
import CustomModal from "../../../components/CustomModal";
import classes from "./AnswerSurvey.module.css";
import { ReactComponent as PublishedSVG } from "../../../resources/icon-published.svg";
import { ReactComponent as DraftedSVG } from "../../../resources/icon-drafted.svg";
import { ReactComponent as ClosedSVG } from "../../../resources/icon-closed.svg";
import Breadcrumbs from "../../../components/Breadcrumbs";
import PrimaryButton from "../../../components/AddItemButton";
import ConfirmationModal from "../../../components/ConfirmationModal";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AnswerSurvey = () => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  const { id } = useParams();
  const history = useHistory();
  const [survey, setSurvey] = useState({});
  const [questions, setQuestions] = useState([]);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasError, setHasError] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleClose = () => {
    setShowSuccess(false);
    setShowConfirmation(false);
    history.goBack();
  };

  useEffect(() => {
    setQuestions(survey.questions);
  }, [survey]);

  const updateStatus = useCallback(async (surveys, studentId) => {
    const studentRef = doc(db, "students", studentId);
    await updateDoc(studentRef, {
      surveys,
    });

    const surveyRef = doc(db, "surveys", id);
    await updateDoc(surveyRef, {
      responses: increment(1),
    });
  }, []);

  useEffect(async () => {
    if (!hasError) {
      const surveyRef = doc(db, "surveys", id);
      await updateDoc(surveyRef, {
        questions,
      });
    }
  }, [questions]);

  useEffect(async () => {
    const docRef = doc(db, "surveys", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setSurvey(docSnap.data());
    } else {
      console.log("No such document!");
    }
  }, []);

  const handleCancel = () => {
    history.goBack();
  };

  const handleCloseSurvey = () => {
    const surveyRef = doc(db, "surveys", id);
    setDoc(surveyRef, { status: "Closed" }, { merge: true });
    history.go(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (const q of questions) {
      if (!q.isAnswered && q.isRequired) {
        setShowError(true);
        setHasError(true);
        return;
      }
    }
    setHasError(false);
    for (const q of questions) {
      if (q.type == "Paragraph") {
        const { isAnswered, error, tempAnswer, ...newQuestion } = q;
        newQuestion.answers.push(tempAnswer);
        setQuestions((prevState) => {
          const newArr = prevState.filter((question) => {
            return question.id != newQuestion.id;
          });
          return [...newArr, newQuestion];
        });
      } else {
        const { isAnswered, options, ...newQuestion } = q;
        for (const o of options) {
          if (o.isChosen) {
            const { isChosen, ...finalOption } = o;
            finalOption.answers++;
            if (newQuestion.options) {
              newQuestion.options.push(finalOption);
            } else {
              newQuestion.options = [finalOption];
            }
          } else {
            const { isChosen, ...finalOption } = o;
            if (newQuestion.options) {
              newQuestion.options.push(finalOption);
            } else {
              newQuestion.options = [finalOption];
            }
          }
        }
        setQuestions((prevState) => {
          const newArr = prevState.filter((question) => {
            return question.id != newQuestion.id;
          });
          return [...newArr, newQuestion];
        });
      }
    }
    const q = query(
      collection(db, "students"),
      where("email", "==", user.email)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      console.log(doc.id, " => ", doc.data());
      const surveys = doc.data().surveys;
      for (const s of surveys) {
        if (s.id == id) {
          s.status = "Answered";
        }
      }
      updateStatus(surveys, doc.id);
    });
    setShowSuccess(true);
  };

  const handleOnAnswer = (question, answer) => {
    if (question.type === "Paragraph") {
      if (question.answers) {
        question.tempAnswer = "";
        if (answer !== "") {
          question.isAnswered = true;
          question.tempAnswer = answer;
        } else if (answer == "") {
          question.isAnswered = false;
        }
      }
    } else if (question.type === "Multiple Choice") {
      for (const index of question.options.keys()) {
        if (question.options[index].option == answer) {
          question.options[index].isChosen = true;
        } else {
          question.options[index].isChosen = false;
        }
        question.isAnswered = true;
      }
    } else {
      for (const index of question.options.keys()) {
        if (question.options[index].option === answer) {
          question.options[index].isChosen = !question.options[index].isChosen;
        } else if (question.options[index].isChosen !== true) {
          question.options[index].isChosen = false;
        }

        let answered = false;
        question.options.map((option) => {
          if (option.isChosen === true) answered = true;
        });
        question.isAnswered = answered;
      }
    }
    setQuestions((prevState) => {
      const newArr = prevState.filter((q) => {
        return q.id != question.id;
      });

      return [...newArr, question];
    });
  };

  return (
    <Fragment>
      {survey.status && !user.isStudent && (
        <Breadcrumbs
          id={id}
          active="preview"
          isDisabled={survey.status !== "Drafted"}
        />
      )}
      <Container className="mt-4">
        <ConfirmationModal
          show={showConfirmation}
          onHide={handleClose}
          onCancel={handleClose}
          onConfirm={handleCloseSurvey}
          title="Confirmation"
        >
          Are you sure you want to close this survey?
        </ConfirmationModal>
        <CustomModal
          show={showError}
          isSuccess={false}
          onHide={() => setShowError(false)}
          title="Error"
        >
          Please answer all the required questions(red) first!
        </CustomModal>
        <CustomModal
          show={showSuccess}
          isSuccess={true}
          onHide={handleClose}
          title="Success"
        >
          Your response has been submitted successfully!
        </CustomModal>

        <Fragment>
          <Row className="justify-content-center align-items-center position-sticky mb-4">
            <Col md={6}>
              <Heading>Replacement Class Time</Heading>
            </Col>
            <Col md={3} className={` text-end align-items-end mt-4`}>
              <div className="d-flex align-items-center justify-content-end">
                {survey.status === "Published" && (
                  <PublishedSVG className="mx-1" />
                )}
                {survey.status === "Drafted" && <DraftedSVG className="mx-1" />}
                {survey.status === "Closed" && <ClosedSVG className="mx-1" />}
                <h4
                  className={`
                  ${survey.status === "Published" ? classes.published : ""}  
                  ${survey.status === "Drafted" ? classes.drafted : ""} 
                  ${survey.status === "Closed" ? classes.closed : ""} my-auto`}
                >
                  {survey.status}
                </h4>
              </div>
            </Col>
          </Row>
          {survey.questions &&
            survey.questions.map((question, index) => {
              return (
                <Row
                  key={index}
                  className={`${
                    index === survey.questions.length - 1 ? "mb-5" : "my-4"
                  } justify-content-center`}
                >
                  <Col md={9}>
                    <AnswerQuestion
                      isPreview={user.isStudent === false}
                      question={question}
                      onAnswer={handleOnAnswer}
                    />
                  </Col>
                </Row>
              );
            })}
        </Fragment>

        {user.isStudent && (
          <Row>
            <Col className="text-center my-4">
              <Buttons
                isDefault={true}
                primary="Submit"
                secondary="Cancel"
                isPublish={true}
                onCancel={handleCancel}
                onSave={handleSubmit}
              />
            </Col>
          </Row>
        )}
        {!user.isStudent && (
          <Fragment>
            {survey.status === "Drafted" && (
              <Row>
                <Col className="text-center mb-5">
                  <PrimaryButton
                    className={classes["add-item-icon"]}
                    isSave={true}
                    onClick={() => history.push(`/surveys/${id}/publish`)}
                  >
                    Publish Survey
                  </PrimaryButton>
                </Col>
              </Row>
            )}
            {survey.status === "Published" && (
              <Row>
                <Col className="text-center mb-5">
                  <Button
                    variant="outline-danger"
                    onClick={() => setShowConfirmation(true)}
                  >
                    Close Survey
                  </Button>
                </Col>
              </Row>
            )}
          </Fragment>
        )}
      </Container>
    </Fragment>
  );
};

export default AnswerSurvey;
