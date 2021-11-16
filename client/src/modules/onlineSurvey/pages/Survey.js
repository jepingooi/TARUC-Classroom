import React, { useEffect, useState, Fragment } from "react";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { Container, Row, Col } from "react-bootstrap";
import SurveyTable from "../../../components/Table";

import SurveyRow from "../components/SurveyRow";
import { useHistory } from "react-router-dom";
import ActionBar from "../../../components/ActionBar";
import Heading from "../../../components/Heading";

const filterList = [
  {
    id: "f1",
    filterText: "All",
  },
  {
    id: "f2",
    filterText: "Published",
  },

  {
    id: "f3",
    filterText: "Closed",
  },

  {
    id: "f4",
    filterText: "Drafted",
  },
];

const headerList = [
  { id: "h1", headerText: "Title" },
  { id: "h2", headerText: "Status" },
  { id: "h3", headerText: "Responses" },
  { id: "h4", headerText: "Start Date" },
  { id: "h5", headerText: "Actions" },
];

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Survey = () => {
  const [surveys, setSurveys] = useState([{}]);

  useEffect(async () => {
    const q = query(collection(db, "surveys"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const surveyList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        surveyList.push({
          id: doc.id,
          title: data.title,
          status: data.status,
          responseNumber: data.responses.length,
          startDate: data.startDate.toDate().toDateString(),
        });
      });
      setSurveys(surveyList);
    });

    return () => unsubscribe();
  }, []);

  const history = useHistory();
  const addSurveyHandler = () => {
    history.push("/surveys/new");
  };

  return (
    <Fragment>
      <Container className="my-3">
        <Heading text="Your Surveys" />
        <ActionBar
          filterList={filterList}
          onClick={addSurveyHandler}
          buttonText={"Add Survey"}
        />
        <Row className="py-3">
          <Col>
            <SurveyTable headers={headerList}>
              <SurveyRow surveys={surveys}></SurveyRow>
            </SurveyTable>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Survey;
