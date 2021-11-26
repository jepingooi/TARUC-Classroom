import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect, Fragment } from "react";
import Chart from "../components/Chart";
import ParagraphResponse from "../components/ParagraphResponse";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyDetails = () => {
  const [survey, setSurvey] = useState({});
  //same as req.params in express
  const { id } = useParams();

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
    <Fragment>
      {survey.questions &&
        survey.questions.map((question, index) => {
          if (question.type != "Paragraph") {
            return <Chart question={question} key={index} />;
          } else {
            return <ParagraphResponse question={question} key={index} />;
          }
        })}
    </Fragment>
  );
};

export default SurveyDetails;
