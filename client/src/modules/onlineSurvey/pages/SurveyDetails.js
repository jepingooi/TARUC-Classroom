import { useParams, useHistory } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect } from "react";
import Chart from "../components/Chart";
import ParagraphResponse from "../components/ParagraphResponse";
import Heading from "../../../components/Heading.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyDetails = () => {
  const [survey, setSurvey] = useState({});
  //same as req.params in express
  const { id } = useParams();
  const history = useHistory();

  useEffect(async () => {
    const docRef = doc(db, "surveys", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const s = docSnap.data();
      setSurvey(s);
    } else {
      console.log("No such document!");
    }
  }, []);

  return (
    <Container className="mt-3">
      <Row className="d-flex align-items-center justify-content-center">
        <Col md={6}>
          <Heading>{survey.title}</Heading>
        </Col>
        <Col md={1} className="text-end">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          {survey.questions &&
            survey.questions.map((question, index) => {
              if (question.type != "Paragraph") {
                return <Chart question={question} key={index} />;
              } else {
                return <ParagraphResponse question={question} key={index} />;
              }
            })}
        </Col>
      </Row>
    </Container>
  );
};

export default SurveyDetails;
