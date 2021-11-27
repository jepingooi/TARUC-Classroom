import {
  Container,
  Col,
  Row,
  Form,
  Card,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import {
  getFirestore,
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  Timestamp,
  arrayUnion,
} from "firebase/firestore";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { useState, useEffect, useRef, Fragment } from "react";
import classes from "./PublishSurvey.module.css";
import buttonClass from "../../../components/Buttons.module.css";
import Heading from "../../../components/Heading";
import { useParams } from "react-router";
import { useHistory } from "react-router-dom";
import Buttons from "../../../components/Buttons";
import CustomModal from "../../../components/CustomModal";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const YEARS = [1, 2, 3];
const SEMESTERS = [1, 2, 3];
const TUTORIAL_GROUPS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const PROGRAMMES = [
  { faculty: "FOCS", programmes: ["RSD", "RIS", "RIT"] },
  { faculty: "FAFB", programmes: ["RAC", "RBU", "REN"] },
  { faculty: "FCCI", programmes: ["RAV", "RPR", "RGD"] },
];

const PublishSurvey = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState({});
  const [students, setStudents] = useState([]);
  const facultyRef = useRef();
  const programmeRef = useRef();
  const tutorialRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(1);
  const history = useHistory();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    setShowSuccess(false);
    history.goBack();
  };

  const handleSemesterChange = (e) => {
    setSemester(Number(e.target.innerText));
  };

  const handleYearChange = (e) => {
    setYear(Number(e.target.innerText));
  };

  useEffect(() => {
    students.map(async (studentId) => {
      const studentRef = doc(db, "students", studentId);
      await updateDoc(studentRef, {
        surveys: arrayUnion({ id, status: "Pending" }),
      });
    });
  }, [students]);

  useEffect(async () => {
    const docRef = doc(db, "surveys", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setSurvey(docSnap.data());
    } else {
      console.log("No such document!");
    }
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();

    const surveyRef = doc(db, "surveys", id);

    if (startDateRef.current.value && endDateRef.current.value) {
      await updateDoc(surveyRef, {
        startDate: Timestamp.fromDate(
          new Date(`${startDateRef.current.value} 12:00:00 AM`)
        ),
        endDate: Timestamp.fromDate(
          new Date(`${endDateRef.current.value} 12:00:00 AM`)
        ),
        status: "Published",
      });
    } else {
      return;
    }

    console.log(facultyRef.current.value);
    console.log(programmeRef.current.value);
    console.log(year);
    console.log(semester);
    console.log(Number(tutorialRef.current.value));

    const q = query(
      collection(db, "students"),
      where("faculty", "==", facultyRef.current.value),
      where("programme", "==", programmeRef.current.value),
      where("year", "==", year),
      where("semester", "==", semester),
      where("tutorialGroup", "==", Number(tutorialRef.current.value))
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      console.log(doc.id, " => ", doc.data());
      setStudents((prevState) => {
        return [...prevState, doc.id];
      });
    });

    setShowSuccess(true);
  };

  return (
    <Container className="mt-3">
      <CustomModal
        show={showSuccess}
        isSuccess={true}
        onHide={handleClose}
        title="Success"
      >
        Your survey has been published successfully!
      </CustomModal>

      <Fragment>
        <Heading>{survey.title}</Heading>
        <Row className="pt-4">
          <Col md={5}>
            <Card bg="light" className={`shadow-sm ${classes.card}`}>
              <Card.Header
                className={`d-flex align-items-center justify-content-center ${classes.header}`}
              >
                <h5>Duration</h5>
              </Card.Header>
              <Card.Body className="d-flex align-items-center justify-content-center">
                <Form>
                  <Form.Group className={`mx-auto mb-3 `} controlId="startDate">
                    <Form.Label>Start Date</Form.Label>
                    <Form.Control
                      ref={startDateRef}
                      autoFocus
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>
                  <Form.Group className={`mx-auto mb-3`} controlId="endDate">
                    <Form.Label>End Date</Form.Label>
                    <Form.Control
                      ref={endDateRef}
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      defaultValue={new Date().toISOString().split("T")[0]}
                    />
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col className="ms-4">
            <Card bg="light" className={`shadow-sm ${classes.card}`}>
              <Card.Header
                className={`d-flex align-items-center justify-content-center ${classes.header}`}
              >
                <h5>Respondent</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Container>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Faculty</Form.Label>
                          <Form.Select
                            autoFocus
                            type="text"
                            required
                            ref={facultyRef}
                          >
                            {PROGRAMMES.map((programme, index) => {
                              const { faculty } = programme;
                              return (
                                <option key={index} value={faculty}>
                                  {faculty}
                                </option>
                              );
                            })}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3" controlId="password">
                          <Form.Label>Programme</Form.Label>
                          <Form.Select
                            autoFocus
                            type="text"
                            required
                            ref={programmeRef}
                          >
                            {PROGRAMMES.map((programme) => {
                              if (facultyRef.current) {
                                const faculty = facultyRef.current.value;

                                if (programme.faculty === faculty) {
                                  return programme.programmes.map(
                                    (p, programmeIndex) => {
                                      console.log(p);
                                      return (
                                        <option key={programmeIndex} value={p}>
                                          {p}
                                        </option>
                                      );
                                    }
                                  );
                                }
                              }
                            })}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>

                  <Container>
                    <Row>
                      <Col>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Year</Form.Label>
                          <ToggleButtonGroup
                            className="d-flex"
                            type="radio"
                            name="year"
                            defaultValue={1}
                          >
                            {YEARS.map((year) => {
                              return (
                                <ToggleButton
                                  className={buttonClass["btn-outline-primary"]}
                                  id={`tbg-year-${year}`}
                                  value={year}
                                  onClick={handleYearChange}
                                >
                                  {year}
                                </ToggleButton>
                              );
                            })}
                          </ToggleButtonGroup>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Semester</Form.Label>
                          <ToggleButtonGroup
                            className="d-flex"
                            type="radio"
                            name="semester"
                            defaultValue={1}
                          >
                            {SEMESTERS.map((semester) => {
                              return (
                                <ToggleButton
                                  className={buttonClass["btn-outline-primary"]}
                                  id={`tbg-semester-${semester}`}
                                  value={semester}
                                  onClick={handleSemesterChange}
                                >
                                  {semester}
                                </ToggleButton>
                              );
                            })}
                          </ToggleButtonGroup>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Container>
                  <Container>
                    <Row className="align-items-center">
                      <Col>
                        <Form.Group className="mb-3" controlId="email">
                          <Form.Label>Tutorial Group</Form.Label>
                          <Form.Select
                            autoFocus
                            type="text"
                            required
                            ref={tutorialRef}
                          >
                            {TUTORIAL_GROUPS.map((group) => {
                              return <option value="group">{group}</option>;
                            })}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col className="mt-3 text-end">
                        <Buttons
                          isDefault={true}
                          isPublish={true}
                          primary="Publish"
                          secondary="Cancel"
                          onCancel={() => {
                            history.goBack();
                          }}
                          onSave={handlePublish}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Fragment>
    </Container>
  );
};

export default PublishSurvey;
