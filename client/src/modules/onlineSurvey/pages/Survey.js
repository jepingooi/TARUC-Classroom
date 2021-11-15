import React, { useEffect, useState, Fragment, useCallback } from "react";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Container, Row, Col } from "react-bootstrap";
import SurveyTable from "../../../components/Table";

import SurveyRow from "../components/SurveyRow";
import { useHistory } from "react-router-dom";
import ActionBar from "../../../components/ActionBar";

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
  const [surveys, setSurveys] = useState([
    {
      id: "",
      title: "",
      status: "",
      responseNumber: 0,
      startDate: null,
    },
  ]);

  useEffect(async () => {
    const surveyCollection = collection(db, "surveys");
    const surveySnapshot = await getDocs(surveyCollection);
    const surveyList = surveySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        status: data.status,
        responseNumber: data.responses.length,
        startDate: data.startDate.toDate().toDateString(),
      };
    });

    setSurveys(surveyList);
  }, []);

  const history = useHistory();
  const addSurveyHandler = () => {
    history.push("/surveys/new");
  };

  return (
    <Fragment>
      <Container className="my-3">
        <Row className="d-flex align-items-center py-3">
          <Col>
            <h1 className="display-5">Your Survey</h1>
          </Col>
        </Row>
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
