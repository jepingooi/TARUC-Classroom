import React, { useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Form, Button, Row, Col, Container, Card } from "react-bootstrap";
import classes from "./Login.module.css";
import AuthContext from "../../../store/auth-context";
import { firebaseConfig } from "../../../firebaseConfig.json";

const Login = (props) => {
  const history = useHistory();

  const authContext = useContext(AuthContext);
  const [email, setEmail] = useState("ooijp-pm18@student.tarc.edu.my");
  const [password, setPassword] = useState("ooijp123");

  const API_KEY = firebaseConfig.apiKey;

  function handleSubmit(event) {
    event.preventDefault();
    fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({ email, password, returnSecureToken: true }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
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
        console.log(data);
        const expirationTime = new Date(
          new Date().getTime() + +data.expiresIn * 1000
        );
        authContext.login(data.idToken, data.email, expirationTime.toISOString);
        history.replace("/videoConferencing");
      })
      .catch((e) => {
        alert(e.message);
      });
  }

  return (
    <Container className="py-5">
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
                  <Button size="md" type="submit">
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
