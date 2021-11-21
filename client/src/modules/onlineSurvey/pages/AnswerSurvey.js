import { Container, Col, Row, Button, Alert } from "react-bootstrap";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import { useParams } from "react-router";
import Heading from "../../../components/Heading";
import AnswerQuestion from "../components/AnswerQuestion";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AnswerSurvey = () => {
  const { id } = useParams();
  const history = useHistory();
  const [survey, setSurvey] = useState({});
  const [show, setShow] = useState(false);
  const [questions, setQuestions] = useState([]);

  useEffect(async () => {
    if (questions.length > 0) {
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
      if (q.type == "Paragraph") {
        const { tempAnswer, ...newQuestion } = q;
        newQuestion.answers.push(tempAnswer);

        setQuestions((prevState) => {
          const newArr = prevState.filter((question) => {
            return question.id != newQuestion.id;
          });

          return [...newArr, newQuestion];
        });
      } else {
        const { options, ...newQuestion } = q;

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

    setShow(true);
  };

  const handleOnAnswer = (question, answer) => {
    if (question.type === "Paragraph") {
      if (question.answers) {
        //question.answers.push(answer);
        question.tempAnswer = "";
        if (answer != "") {
          question.tempAnswer = answer;
        }
      }
    } else if (question.type === "Multiple Choice") {
      for (const index of question.options.keys()) {
        console.log(question.options[index]);
        if (question.options[index].option == answer) {
          //question.options[index].answers++;
          question.options[index].isChosen = true;
        } else {
          question.options[index].isChosen = false;
        }
      }
    } else {
      for (const index of question.options.keys()) {
        console.log(question.options[index]);
        if (question.options[index].option == answer) {
          //question.options[index].answers++;
          if (question.options[index].isChosen == true) {
            question.options[index].isChosen = false;
          } else {
            question.options[index].isChosen = true;
          }
        } else {
          if (question.options[index].isChosen != true) {
            question.options[index].isChosen = false;
          }
        }
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
      <Alert show={show} variant="success">
        <Alert.Heading>Success</Alert.Heading>
        <p>You have submitted the survey!</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => history.goBack()} variant="outline-success">
            Done
          </Button>
        </div>
      </Alert>

      {!show && (
        <Fragment>
          <Row className="align-items-center position-sticky mb-4">
            <Col>
              <Heading>{survey.title}</Heading>
            </Col>
          </Row>
          {survey.questions &&
            survey.questions.map((question, index) => {
              return (
                <Row key={index} className={`${index == 0 ? "mt-3" : "mt-4"}`}>
                  <Col>
                    <AnswerQuestion
                      question={question}
                      onAnswer={handleOnAnswer}
                    />
                  </Col>
                </Row>
              );
            })}
        </Fragment>
      )}
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
