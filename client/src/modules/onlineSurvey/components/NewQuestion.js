import { Container, Row, Col, Form, Button } from "react-bootstrap";
import classes from "./NewQuestion.module.css";
import { ReactComponent as DeleteSVG } from "../../../resources/icon-delete.svg";

const NewQuestion = (props) => {
  return (
    <Container
      className={`${classes.container} p-4 border border-1 rounded shadow-sm`}
    >
      <Row className="align-items-center">
        <Col md={5}>
          <Form.Control
            placeholder="Question"
            size="lg"
            type="text"
            className={`${classes.question}`}
          />
        </Col>

        <Col className="text-right" md={{ span: 3, offset: 4 }}>
          <Form.Select size="lg" aria-label="Question select">
            <option value="paragraph">Paragraph</option>
            <option value="multiple-choice">Multiple Choice</option>
            <option value="checkbox">Checkbox</option>
          </Form.Select>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={5}>
          {props.type === "paragraph" && (
            <Form.Control
              size="lg"
              type="text"
              placeholder="Text Answer"
              readOnly
              className={classes.paragraph}
            />
          )}
          {props.type === "multiple-choice" &&
            ["radio"].map((type) => (
              <div key={`default-${type}`} className="mb-3">
                <Form.Check
                  type={type}
                  id={`default-${type}`}
                  label={`default ${type}`}
                />

                <Form.Check
                  disabled
                  type={type}
                  label={`disabled ${type}`}
                  id={`disabled-default-${type}`}
                />
              </div>
            ))}
          {props.type === "checkbox" &&
            ["checkbox"].map((type) => (
              <div key={`default-${type}`} className="mb-3">
                <Form.Check
                  type={type}
                  id={`default-${type}`}
                  label={`default ${type}`}
                />

                <Form.Check
                  disabled
                  type={type}
                  label={`disabled ${type}`}
                  id={`disabled-default-${type}`}
                />
              </div>
            ))}
        </Col>
      </Row>
      <hr className="mt-5 mb-3" />
      <Row>
        <Col className="d-flex justify-content-end">
          <Form.Check
            className="pt-1"
            type="switch"
            id="custom-switch"
            label="Required"
          />
          <Button
            size="lg"
            variant="light"
            className={`${classes.delete} mx-2 pt-0`}
          >
            <DeleteSVG />
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NewQuestion;
