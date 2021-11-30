import { useParams, useHistory } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect, useRef, Fragment } from "react";
import Heading from "../../../components/Heading.js";
import { useReactToPrint } from "react-to-print";
import Buttons from "../../../components/Buttons";
import SurveyResponses from "../components/SurveyResponses";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyDetails = () => {
  const [survey, setSurvey] = useState({});
  const [bottom, setBottom] = useState(false);
  const componentRef = useRef();
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

  const getPageMargins = () => {
    return `@page { margin: ${10000} ${10} ${10} ${10} !important; }`;
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: survey.title,
  });

  const handleBack = () => history.replace("/surveys?filter=All");

  return (
    <Fragment>
      <Container className="mt-3">
        <Row className="align-items-center justify-content-center">
          <Col md={5}>
            <Heading>{survey.title}</Heading>
          </Col>
          <Col md={2} className="text-end pt-2 pe-0">
            <Buttons
              isDefault={true}
              primary="Print"
              secondary="Back"
              onCancel={handleBack}
              onSave={handlePrint}
            />
          </Col>
        </Row>
        <Row>
          <Col ref={componentRef}>
            <SurveyResponses
              showTitle={true}
              survey={survey}
              onChange={handleScroll}
            />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default SurveyDetails;
