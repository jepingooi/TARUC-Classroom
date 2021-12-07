import classes from "./ParagraphResponse.module.css";
import { Form, Row, Col } from "react-bootstrap";
import { Fragment } from "react";
const ParagraphResponse = (props) => {
  const { question } = props;
  return (
    <Fragment>
      <Form>
        <Row className="align-items-center mb-2">
          <Col md={6}>
            <h3 className={`${classes.question} py-2`}>{question.question}</h3>
          </Col>
        </Row>
        {question.answers.map((answer, index) => {
          return (
            <Row key={index} className="my-2">
              <Col>
                <Form.Control
                  disabled
                  size="lg"
                  type="text"
                  placeholder={answer}
                  className={`${classes.response}`}
                />
              </Col>
            </Row>
          );
        })}
      </Form>
    </Fragment>
  );
};

export default ParagraphResponse;
