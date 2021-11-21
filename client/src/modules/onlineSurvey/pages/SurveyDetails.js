import { useParams } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Chart from "../components/Chart";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyDetails = () => {
  const [survey, setSurvey] = useState({});
  //same as req.params in express
  const { id } = useParams();
  console.log(id);

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

  return <Chart survey={survey} />;
};

export default SurveyDetails;
