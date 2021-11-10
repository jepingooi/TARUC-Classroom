import React, { useState, useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import classes from "./login.module.css";
import AuthContext from "../../../store/auth-context";
import * as yup from "yup";
import { Formik } from "formik";

const Login = (props) => {
  const history = useHistory();

  const authContext = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_KEY = "AIzaSyA7sbTCrstTgUDyn3OmGxaI494sxwat26w";

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
        authContext.login(data.idToken);
        history.replace("/videoConferencing");
      })
      .catch((e) => {
        alert(e.message);
      });
  }

  return (
    <div className={classes.login}>
      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="mb-3" size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3" size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>
        <Button block size="lg" type="submit">
          Login
        </Button>
      </Form>
    </div>
  );
};

export default Login;
