import { Button, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import classes from "./AccessDenied.module.css";
const AccessDenied = () => {
  const history = useHistory();
  return (
    <Container className={classes.background}>
      <Row>
        <Col>
          <h1 className="my-5 display-5 text-center">
            You don't have accesss to this module!
          </h1>
        </Col>
      </Row>

      <Row>
        <Col className="text-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default AccessDenied;
