import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useReducer,
  Fragment,
} from "react";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Container, Row, Col } from "react-bootstrap";
import SurveyTable from "../../../components/Table";

import SurveyRow from "../components/SurveyRow";
import { useHistory, useLocation } from "react-router-dom";
import ActionBar from "../../../components/ActionBar";
import Heading from "../../../components/Heading";
import AuthContext from "../../../store/context";
import ConfirmationModal from "../../../components/ConfirmationModal";
import AddSurveyButton from "../../../components/AddItemButton";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const filterList = ["All", "Published", "Closed", "Drafted"];

const studentFilter = ["All", "Answered", "Pending"];

const headerList = ["Title", "Status", "Responses", "Created Date", "Actions"];

const studentHeaderList = ["Title", "Status", "Deadline", "Action"];

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const confirmationReducer = (state, action) => {
  if (action.message) {
    return { message: action.message, survey: action.survey };
  }
  return { message: "", survey: {} };
};

const Survey = () => {
  const history = useHistory();
  let myQuery = useQuery();

  const authContext = useContext(AuthContext);
  const [surveys, setSurveys] = useState();
  const [search, setSearch] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationState, dispatchConfirmation] = useReducer(
    confirmationReducer,
    { message: "", survey: {} }
  );

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

  const updateStudent = useCallback(async (studentId, surveyId, surveys) => {
    const studentRef = doc(db, "students", studentId);
    const newSurveys = surveys.filter((survey) => {
      return survey.id != surveyId;
    });

    await updateDoc(studentRef, {
      surveys: newSurveys,
    });
  }, []);

  const handleDelete = async () => {
    const { id } = confirmationState.survey;
    console.log(id);
    await deleteDoc(doc(db, "surveys", id));
    const q = query(collection(db, "students"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      console.log(doc.id, " => ", doc.data());
      const surveys = doc.data().surveys;
      updateStudent(doc.id, id, surveys);
    });
    setShowConfirmation(false);
  };

  const handleShow = (survey) => {
    dispatchConfirmation({
      message: `Are you sure you want to delete survey '${survey.title}'?`,
      survey,
    });

    setShowConfirmation(true);
  };

  const handleClose = () => {
    setShowConfirmation(false);
  };

  let renderSurvey;

  if (surveys) {
    if (surveys.length > 0) {
      renderSurvey = (
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
                  onDelete={handleShow}
                />
              </SurveyTable>
            </Col>
          </Row>
        </Fragment>
      );
    }
  }

  return (
    <Container className="mt-3">
      <ConfirmationModal
        show={showConfirmation}
        onHide={handleClose}
        onCancel={handleClose}
        onConfirm={handleDelete}
        title="Confirmation"
      >
        {confirmationState.message}
      </ConfirmationModal>

      {surveys && surveys.length == 0 && (
        <Heading>Nothing to show here.</Heading>
      )}

      {renderSurvey}

      {surveys && surveys.length == 0 && !user.isStudent && (
        <div className="py-3">
          <AddSurveyButton
            buttonText={"Add Survey"}
            onClick={() => history.push("/surveys/new")}
          />
        </div>
      )}
    </Container>
  );
};

export default Survey;
