import { Row, Col, Form } from "react-bootstrap";
import classes from "./AnswerQuestion.module.css";
import { useState, useEffect, Fragment } from "react";

const AnswerQuestion = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [errors, setErrors] = useState({});

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} className="my-3" md={3}>
        {question.options.map((option, index) => {
          return (
            <Fragment key={index}>
              <Form.Check
                disabled={props.isPreview}
                key={index}
                type={optionType}
                label={option.option}
                name={question.question}
                id={`${question.question}-${index}`}
                className={index == 0 ? "" : "mt-2"}
                onChange={(e) => {
                  props.onAnswer(
                    question,
                    e.target.parentNode.lastChild.innerText
                  );
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.answer}
              </Form.Control.Feedback>
            </Fragment>
          );
        })}
      </Col>
    );
  };

  return (
    <Form
      noValidate
      className={`${
        (question.isRequired && question.isAnswered) || !question.isRequired
          ? classes.container
          : classes.required
      }  p-4 border border-1 rounded shadow-sm`}
    >
      <Row className="align-items-center mb-2">
        <Col md={6}>
          <h3 className={`${classes.question} py-2`}>{question.question}</h3>
        </Col>
      </Row>
      <Row>
        {question.type === "Paragraph" && (
          <Col md={7}>
            <Form.Control
              size="lg"
              type="text"
              disabled={props.isPreview}
              required={question.isRequired ? 1 : 0}
              placeholder="Text Answer"
              className={`mt-3 ${classes.paragraph} `}
              onBlur={(e) => {
                props.onAnswer(question, e.target.value);
              }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.answer}
            </Form.Control.Feedback>
          </Col>
        )}
        {question.type === "Multiple Choice" && renderOptions("radio")}
        {question.type === "Checkbox" && renderOptions("checkbox")}
      </Row>
    </Form>
  );
};

export default AnswerQuestion;
