import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Card,
  Alert,
} from "react-bootstrap";
import classes from "./Login.module.css";
import AuthContext from "../../../store/auth-context";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Register = (props) => {
  const history = useHistory();

  const authContext = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [hasError, setHasError] = useState(false);

  const API_KEY = firebaseConfig.apiKey;

  function handleSubmit(event) {
    event.preventDefault();

    const auth = getAuth();

    if (email) {
      const emailDomain = email.split("@")[1];
      let userCollection;
      if (emailDomain.startsWith("student") || emailDomain.startsWith("tarc")) {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            history.push("/login");
          })
          .catch((error) => {
            setHasError(true);

            setError("Please enter a valid email and password.");
            console.log(error);
          });
      } else {
        setHasError(true);
        setError("Please enter a valid TARUC email");
        return;
      }
    } else {
      setHasError(true);
      setError("Please enter a valid TARUC email");
    }
  }

  return (
    <Container className={`py-5 ${classes.background}`}>
      {hasError && (
        <Row>
          <Col md={{ span: 4, offset: 4 }}>
            <Alert show={hasError} variant="danger">
              <Alert.Heading>Error</Alert.Heading>
              <p>{error}</p>
              <hr />
              <div className="d-flex justify-content-end">
                <Button
                  onClick={() => setHasError(false)}
                  variant="outline-danger"
                >
                  Okay
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      <Row className="justify-content-md-center">
        <Col md={4}>
          <Card bg="light">
            <Card.Header>Register</Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    autoFocus
                    type="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button className={classes.button} size="md" type="submit">
                    Register
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
