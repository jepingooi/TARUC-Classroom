import {
  Row,
  Col,
  Form,
  Button,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import classes from "./AnswerQuestion.module.css";
import { ReactComponent as DeleteSVG } from "../../../resources/icon-delete.svg";
import { ReactComponent as CloseSVG } from "../../../resources/icon-close.svg";
import { useState, useRef, useEffect } from "react";

const AnswerQuestion = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [option, setOption] = useState();

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} className="my-3" md={3}>
        {question.options.map((option, index) => {
          return (
            <Form.Check
              key={index}
              type={optionType}
              label={option.option}
              name={question.question}
              id={`${question.question}-${index}`}
              className={index == 0 ? "" : "mt-2"}
              onChange={(e) => {
                // console.log(e.target.parentNode.lastChild.innerText);
                // setOption(e.target.parentNode.lastChild.innerText);
                props.onAnswer(
                  question,
                  e.target.parentNode.lastChild.innerText
                );
              }}
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
      <Row className="align-items-center mb-2">
        <Col md={6}>
          <h3 className={`${classes.question} py-2`}>{question.question}</h3>
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
              onBlur={(e) => {
                props.onAnswer(question, e.target.value);
              }}
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
