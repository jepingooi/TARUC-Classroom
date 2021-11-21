import { Container, Col, Row, Form, Button, Alert } from "react-bootstrap";
import {
  collection,
  addDoc,
  Timestamp,
  getFirestore,
  doc,
  getDoc,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useContext, useEffect, Fragment } from "react";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import { useParams } from "react-router";
import AuthContext from "../../../store/auth-context";
import Heading from "../../../components/Heading";
import AnswerQuestion from "../components/AnswerQuestion";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AnswerSurvey = () => {
  const { id } = useParams();
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const [survey, setSurvey] = useState({});
  const [show, setShow] = useState(false);
  const { user } = authContext;

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

    // const result = await addDoc(collection(db, "surveys"), {
    //   createdDate: Timestamp.fromDate(new Date()),
    //   owner: user.email,
    //   questions,
    //   status: "Drafted",
    //   title,
    //   responses: [],
    // });

    setShow(true);
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
                    <AnswerQuestion question={question} />
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
