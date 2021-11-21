import {
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import classes from "./NewQuestion.module.css";
import { ReactComponent as DeleteSVG } from "../../../resources/icon-delete.svg";
import { ReactComponent as CloseSVG } from "../../../resources/icon-close.svg";
import { useState, useRef, useEffect } from "react";

const AnswerQuestion = (props) => {
  const [question, setQuestion] = useState(props.question);
  console.log(question);

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} className="my-3" md={3}>
        {question.options.map((option, index) => {
          return (
            <Form.Check
              type={optionType}
              label={option.option}
              name="group"
              id={`option-${index}`}
              className={index == 0 ? "" : "mt-2"}
            />
          );
        })}
      </Col>
    );
  };

  return (
    <Form
      className={`${classes.container} p-4 border border-1 rounded shadow-sm`}
    >
      <Row className="align-items-center">
        <Col>
          <h3>{question.question}</h3>
        </Col>
      </Row>
      <Row>
        {question.type === "Paragraph" && (
          <Col md={5}>
            <Form.Control
              size="lg"
              type="text"
              placeholder="Text Answer"
              className={`mt-3 ${classes.paragraph}`}
            />
          </Col>
        )}
        {question.type === "Multiple Choice" && renderOptions("radio")}
        {question.type === "Checkbox" && renderOptions("checkbox")}
      </Row>
    </Form>
  );
};

export default AnswerQuestion;
