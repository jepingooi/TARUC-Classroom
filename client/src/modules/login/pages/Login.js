import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Form, Button, Row, Col, Container, Card, Alert } from "react-bootstrap";
import classes from "./Login.module.css";
import AuthContext from "../../../store/auth-context";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore/lite";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Login = (props) => {
  const history = useHistory();

  const authContext = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [hasError, setHasError] = useState(false);

  const API_KEY = firebaseConfig.apiKey;

  function handleSubmit(event) {
    event.preventDefault();
    fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
      method: "POST",
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(() => {
            let errMsg = "Authentication Failed";
            throw new Error(errMsg);
          });
        }
      })
      .then((data) => {
        let user;
        const fetchUser = async () => {
          const emailDomain = data.email.split("@")[1];
          let userCollection;
          if (emailDomain.startsWith("student")) {
            userCollection = "students";
          } else {
            userCollection = "staff";
          }

          const usersRef = collection(db, userCollection);
          const q = query(usersRef, where("email", "==", data.email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            user = doc.data();
            switch (userCollection) {
              case "students":
                user.isStudent = true;
                break;
              default:
                user.isStudent = false;
            }
            const expirationTime = new Date(new Date().getTime() + +data.expiresIn * 1000);

            authContext.login(data.idToken, user, expirationTime.toISOString());
            history.replace("/videoConferencing");
          });
        };

        fetchUser();
      })
      .catch((e) => {
        setHasError(true);

        setError("Please enter a valid email and password.");
        console.log(error);
      });
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
                <Button onClick={() => setHasError(false)} variant="outline-danger">
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
            <Card.Header>Login</Card.Header>
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
                    Login
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

export default Login;
