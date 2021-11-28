import { Container, Col, Row } from "react-bootstrap";
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
  console.log(questions);
  const handleClose = () => {
    setShowSuccess(false);
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
    console.log(hasError);
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
    <Container className="mt-4">
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
        <Row className="justify-content-around align-items-center position-sticky mb-4">
          <Col md={9}>
            <Heading>Replacement Class Time</Heading>
          </Col>
        </Row>
        {survey.questions &&
          survey.questions.map((question, index) => {
            return (
              <Row
                key={index}
                className={`${
                  index == 0 ? "mt-3" : "mt-4"
                } justify-content-center`}
              >
                <Col md={9}>
                  <AnswerQuestion
                    question={question}
                    onAnswer={handleOnAnswer}
                  />
                </Col>
              </Row>
            );
          })}
      </Fragment>

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
    </Container>
  );
};

export default AnswerSurvey;
