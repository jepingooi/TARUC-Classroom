import { Form, Button, Row, Col, Container, Card } from "react-bootstrap";
import { Fragment } from "react";
import classes from "./AuthenticationForm.module.css";
import React, { useState } from "react";
const AuthenticationForm = (props) => {
  const { errors } = props;
  return (
    <Fragment>
      <Row className="justify-content-md-center">
        <Col md={4}>
          <Card bg="light">
            <Card.Header>{props.children}</Card.Header>
            <Card.Body>
              <Form noValidate onSubmit={props.onSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    isInvalid={!!errors.email}
                    onChange={props.onEmailChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    isInvalid={!!errors.password}
                    onChange={props.onPasswordChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button className={classes.button} size="md" type="submit">
                    {props.children}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default AuthenticationForm;
