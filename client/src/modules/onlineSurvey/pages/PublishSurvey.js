import {
  Container,
  Col,
  Row,
  Form,
  Card,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Button,
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  const [show, setShow] = useState(false);

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

    const cityRef = doc(db, "surveys", id);

    if (startDateRef.current.value && endDateRef.current.value) {
      await updateDoc(cityRef, {
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

    setShow(true);
  };

  return (
    <Container className="mt-3">
      <Alert show={show} variant="success">
        <Alert.Heading>Success</Alert.Heading>
        <p>Your survey has been published successfully!</p>
        <hr />
        <div className="d-flex justify-content-end">
          <Button onClick={() => history.goBack()} variant="outline-success">
            Done
          </Button>
        </div>
      </Alert>

      {!show && (
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
                    <Form.Group
                      className={`mx-auto mb-3 `}
                      controlId="startDate"
                    >
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        ref={startDateRef}
                        autoFocus
                        type="date"
                        required
                      />
                    </Form.Group>
                    <Form.Group className={`mx-auto mb-3`} controlId="endDate">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control ref={endDateRef} type="date" required />
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
                              <option value="FOCS">FOCS</option>
                              <option value="FAFB">FAFB</option>
                              <option value="FCCI">FCCI</option>
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
                              <option value="RSD">RSD</option>
                              <option value="RIS">RIS</option>
                              <option value="RIT">RIT</option>
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
                              <ToggleButton
                                className={buttonClass["btn-outline-primary"]}
                                id="tbg-year-1"
                                value={1}
                                onClick={handleYearChange}
                              >
                                1
                              </ToggleButton>
                              <ToggleButton
                                className={buttonClass["btn-outline-primary"]}
                                id="tbg-year-2"
                                value={2}
                                onClick={handleYearChange}
                              >
                                2
                              </ToggleButton>
                              <ToggleButton
                                className={buttonClass["btn-outline-primary"]}
                                id="tbg-year-3"
                                value={3}
                                onClick={handleYearChange}
                              >
                                3
                              </ToggleButton>
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
                              <ToggleButton
                                className={buttonClass["btn-outline-primary"]}
                                id="tbg-semester-1"
                                value={1}
                                onClick={handleSemesterChange}
                              >
                                1
                              </ToggleButton>
                              <ToggleButton
                                className={buttonClass["btn-outline-primary"]}
                                id="tbg-semester-2"
                                value={2}
                                onClick={handleSemesterChange}
                              >
                                2
                              </ToggleButton>
                              <ToggleButton
                                className={buttonClass["btn-outline-primary"]}
                                id="tbg-semester-3"
                                value={3}
                                onClick={handleSemesterChange}
                              >
                                3
                              </ToggleButton>
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
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="3">4</option>
                              <option value="3">5</option>
                              <option value="3">6</option>
                              <option value="3">7</option>
                              <option value="3">8</option>
                              <option value="3">9</option>
                              <option value="3">10</option>
                              <option value="3">11</option>
                              {/* <option value="Multiple Choice">FAFB</option>
                    <option value="Checkbox">FCCI</option> */}
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
      )}
    </Container>
  );
};

export default PublishSurvey;
