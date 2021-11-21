import React, { useEffect, useState, useContext } from "react";
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
import { Container, Row, Col } from "react-bootstrap";
import SurveyTable from "../../../components/Table";

import SurveyRow from "../components/SurveyRow";
import { useHistory, useLocation } from "react-router-dom";
import ActionBar from "../../../components/ActionBar";
import Heading from "../../../components/Heading";
import AuthContext from "../../../store/auth-context";

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

const studentHeaderList = [
  { id: "h1", headerText: "Title" },
  { id: "h2", headerText: "Status" },
  { id: "h3", headerText: "Deadline" },
  { id: "h4", headerText: "Action" },
];
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

  return (
    <Container className="mt-3">
      <Heading>Your Surveys</Heading>
      <ActionBar
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
            ></SurveyRow>
          </SurveyTable>
        </Col>
      </Row>
    </Container>
  );
};

export default Survey;
