import { Form, Button, Row, Col, Card } from "react-bootstrap";
import { Fragment } from "react";
import classes from "./AuthenticationForm.module.css";

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
                {props.children === "Register" && (
                  <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      isInvalid={!!errors.name}
                      onChange={props.onNameChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                )}

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
            {props.children === "Login" && (
              <Card.Footer className={`${classes.footer} text-center`}>
                <Card.Link onClick={props.onReset}>Forgot Password</Card.Link>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default AuthenticationForm;
