import React, { useEffect, useState, useContext, Fragment } from "react";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
} from "firebase/firestore";
import { Container, Row, Col, Alert, Button } from "react-bootstrap";
import SurveyTable from "../../../components/Table";

import SurveyRow from "../components/SurveyRow";
import { useHistory, useLocation } from "react-router-dom";
import ActionBar from "../../../components/ActionBar";
import Heading from "../../../components/Heading";
import AuthContext from "../../../store/auth-context";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const filterList = ["All", "Published", "Closed", "Drafted"];

const studentFilter = ["All", "Answered", "Pending"];

const headerList = ["Title", "Status", "Responses", "Start Date", "Actions"];

const studentHeaderList = ["Title", "Status", "Deadline", "Action"];

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Survey = () => {
  const history = useHistory();
  let myQuery = useQuery();

  const authContext = useContext(AuthContext);
  const [surveys, setSurveys] = useState([]);
  const [search, setSearch] = useState([]);
  const [hasDelete, setHasDelete] = useState(false);
  const { user } = authContext;

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) {
      params.append("search", search);
    } else {
      params.delete("search");
    }
    history.push({ search: params.toString() });
  }, [search, history]);

  const getStaffSurveys = async () => {
    let surveyQuery = query(
      collection(db, "surveys"),
      where("owner", "==", user.email)
    );

    const unsubscribe = onSnapshot(surveyQuery, (querySnapshot) => {
      const surveyList = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        surveyList.push({
          id: doc.id,
          title: data.title,
          status: data.status,
          responseNumber: data.responses,
          createdDate: data.createdDate.toDate().toDateString(),
        });
      });

      setSurveys(surveyList);
    });

    return unsubscribe;
  };

  const getStudentSurveys = async () => {
    //get all survey id for the student
    let studentSurveys = [[]];
    //go to survey databse and find all matching data
    let q = query(collection(db, "students"), where("email", "==", user.email));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      studentSurveys = doc.data().surveys;
      const surveyId = studentSurveys.map((survey) => survey.id);
      console.log(surveyId);
      const surveyQuery = query(
        collection(db, "surveys"),
        where("status", "!=", "Drafted")
      );

      const unsubscribe = onSnapshot(surveyQuery, (querySnapshot) => {
        const surveyList = [];

        querySnapshot.forEach((doc) => {
          if (surveyId.includes(doc.id)) {
            const data = doc.data();
            let status;
            for (const survey of studentSurveys) {
              if (survey.id === doc.id) {
                status = survey.status;
              }
            }
            surveyList.push({
              id: doc.id,
              title: data.title,
              status: status,
              endDate: data.endDate.toDate().toDateString(),
            });
          }
        });

        setSurveys(surveyList);
      });

      return unsubscribe;
    });
  };

  //fetch user's survey
  useEffect(() => {
    let unsubscribe;
    if (user.isStudent) {
      getStudentSurveys().then(() => {
        return () => unsubscribe();
      });
    } else {
      getStaffSurveys().then(() => {
        return () => unsubscribe();
      });
    }
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleDelete = () => {
    setHasDelete(true);
  };

  return (
    <Container className="mt-3">
      {hasDelete && (
        <Row>
          <Col className="my-5" md={{ span: 6, offset: 3 }}>
            <Alert show={hasDelete} variant="danger">
              <Alert.Heading>Success</Alert.Heading>
              <p>Survey deleted successfully!</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button
                  onClick={() => setHasDelete(false)}
                  variant="outline-danger"
                >
                  Done
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      {!hasDelete && surveys.length > 0 && (
        <Fragment>
          <Heading>Your Surveys</Heading>
          <ActionBar
            studentFilter={studentFilter}
            filterList={filterList}
            onClick={() => history.push("/surveys/new")}
            buttonText={"Add Survey"}
            isStudent={user.isStudent}
            onSearch={handleSearch}
          />
          <Row className="py-3">
            <Col>
              <SurveyTable
                headers={user.isStudent ? studentHeaderList : headerList}
              >
                <SurveyRow
                  search={myQuery.get("search")}
                  filter={myQuery.get("filter")}
                  surveys={surveys}
                  onDelete={handleDelete}
                />
              </SurveyTable>
            </Col>
          </Row>
        </Fragment>
      )}
      {surveys.length == 0 && <Heading>No survey to show.</Heading>}
    </Container>
  );
};

export default Survey;
