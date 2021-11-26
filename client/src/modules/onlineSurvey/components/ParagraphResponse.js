import classes from "./ParagraphResponse.module.css";
import { Container, Form, Row, Col } from "react-bootstrap";
const ParagraphResponse = (props) => {
  const { question } = props;
  console.log(question.answers);
  return (
    <Container
      className={`${classes.container} p-4 border border-1 rounded shadow-sm my-4`}
    >
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
    </Container>
  );
};

export default ParagraphResponse;
