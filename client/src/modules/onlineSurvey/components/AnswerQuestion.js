import { Row, Col, Form } from "react-bootstrap";
import classes from "./AnswerQuestion.module.css";
import { useState, useEffect, Fragment } from "react";

const AnswerQuestion = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [questionForm, setQuestionForm] = useState({});
  const [errors, setErrors] = useState({});
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    setIsValidated(props.isValidated);
  });

  const setField = (field, value) => {
    setIsValidated(false);
    setQuestionForm((prevState) => {
      return { ...prevState, [field]: value };
    });

    if (!!errors[field]) {
      setErrors((prevState) => {
        return { ...prevState, [field]: null };
      });
    }
  };

  const findFormErrors = () => {
    const { answer } = questionForm;

    const newErrors = {};
    // required errors
    if (!answer || (answer === "" && question.isRequired === true))
      newErrors.answer = "Answer is required!";

    return newErrors;
  };

  useEffect(() => {
    if (isValidated) {
      if (question.isRequired) {
        const newErrors = findFormErrors();
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          props.setError(true);
        } else {
          props.setError(false);
        }
      } else {
        props.setError(false);
      }
    }
  }, [isValidated]);

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} className="my-3" md={3}>
        {question.options.map((option, index) => {
          return (
            <Fragment key={index}>
              <Form.Check
                required={question.isRequired ? 1 : 0}
                isInvalid={!!errors.answer}
                key={index}
                type={optionType}
                label={option.option}
                name={question.question}
                id={`${question.question}-${index}`}
                className={index == 0 ? "" : "mt-2"}
                onChange={(e) => {
                  setField("answer", e.target.parentNode.lastChild.innerText);
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
      className={`${classes.container} p-4 border border-1 rounded shadow-sm`}
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
              required={question.isRequired ? 1 : 0}
              placeholder="Text Answer"
              isInvalid={!!errors.answer}
              onChange={(e) => setField("answer", e.target.value)}
              className={`mt-3 ${classes.paragraph}`}
              onBlur={(e) => {
                setField("answer", e.target.value);
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
