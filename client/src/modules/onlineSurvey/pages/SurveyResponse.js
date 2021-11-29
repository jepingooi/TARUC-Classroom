import { useParams, useHistory } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect, Fragment } from "react";
import Chart from "../components/Chart";
import ParagraphResponse from "../components/ParagraphResponse";
import Heading from "../../../components/Heading.js";
import classes from "./SurveyResponse.module.css";
import Breadcrumbs from "../../../components/Breadcrumbs";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyDetails = () => {
  const [survey, setSurvey] = useState({});
  const [bottom, setBottom] = useState(false);

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

  useEffect(async () => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [bottom]);

  const handleScroll = (chart, index) => {
    if (index !== survey.questions.length - 1) {
      const yOffset = -50;
      const y =
        chart.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      console.log(bottom);
      setBottom((prevState) => {
        return !prevState;
      });
    }
  };

  return (
    <Fragment>
      <Breadcrumbs id={id} active="response" />
      <Container className="mt-3">
        <Row className="d-flex align-items-center justify-content-center">
          <Col md={{ span: 6 }}>
            <Heading>{survey.title}</Heading>
          </Col>
          <Col md={1} className="text-end">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                history.replace("/surveys?filter=All");
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
                return (
                  <Container
                    key={index}
                    className={`${classes.container} p-4 border border-1 rounded shadow-sm my-4`}
                  >
                    {question.type != "Paragraph" ? (
                      <Chart
                        question={question}
                        key={index}
                        index={index}
                        onChange={handleScroll}
                      />
                    ) : (
                      <ParagraphResponse question={question} key={index} />
                    )}
                  </Container>
                );
              })}
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SurveyDetails;
