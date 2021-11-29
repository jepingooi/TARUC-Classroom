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
import { useState, useRef, useEffect, Fragment } from "react";

const NewQuestion = (props) => {
  const [question, setQuestion] = useState();
  const questionRef = useRef(null);
  const optionRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    setQuestion(props.question);
  }, [props.question]);

  useEffect(() => {
    if (question && question.type && question.question) {
      questionRef.current.value = question.type;
      titleRef.current.value = question.question;
    }
  }, [question]);

  const handleTypeChange = () => {
    props.onTypeChange(question, questionRef.current.value);
  };

  const handleQuestionChange = (e) => {
    props.onChange(question, e.target.value);
  };

  const handleRequireChange = (e) => {
    props.onRequireChange(question, e.target.checked);
  };

  const handleDeleteQeustion = () => {
    props.onDelete(question);
  };

  const handleRemoveOption = (option) => {
    props.onRemoveOption(question, option);
  };

  const handleAddOption = () => {
    props.onAddOption(question, optionRef.current.value);
  };

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} md={4}>
        {question.options !== undefined &&
          question.options.map((option, index) => {
            return (
              <div key={index} className="d-flex align-items-center">
                <Form.Check
                  type={optionType}
                  label={option.option}
                  name={question.question}
                  id={`${question.question}-${index}`}
                />
                <Button
                  size="lg"
                  variant="light"
                  className={`${classes.delete} mx-2 pt-0`}
                  onClick={handleRemoveOption.bind(null, option)}
                >
                  <CloseSVG />
                </Button>
              </div>
            );
          })}

        <InputGroup className="mt-2">
          <FormControl
            placeholder="Add Option"
            aria-label="Add Option"
            aria-describedby="basic-add"
            ref={optionRef}
          />
          <Button
            className={classes["btn-outline-primary"]}
            id="button-add"
            onClick={handleAddOption}
          >
            Add
          </Button>
        </InputGroup>
      </Col>
    );
  };

  return (
    <Fragment>
      {question && (
        <Form
          className={`${classes.container} p-4 border border-1 rounded shadow-sm`}
        >
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Control
                placeholder="Question"
                size="lg"
                type="text"
                className={`${classes.question}`}
                onBlur={handleQuestionChange}
                ref={titleRef}
              />
            </Col>

            <Col className="text-right" md={{ span: 4, offset: 2 }}>
              <Form.Select
                onChange={handleTypeChange}
                size="lg"
                aria-label="Question select"
                ref={questionRef}
              >
                <option value="Paragraph">Paragraph</option>
                <option value="Multiple Choice">Multiple Choice</option>
                <option value="Checkbox">Checkbox</option>
              </Form.Select>
            </Col>
          </Row>
          <Row className="mt-3">
            {question.type === "Paragraph" && (
              <Col md={5}>
                <Form.Control
                  size="lg"
                  type="text"
                  placeholder="Text Answer"
                  readOnly
                  className={classes.paragraph}
                />
              </Col>
            )}
            {question.type === "Multiple Choice" && renderOptions("radio")}
            {question.type === "Checkbox" && renderOptions("checkbox")}
          </Row>
          <hr className="mt-5 mb-3" />
          <Row>
            <Col className="d-flex justify-content-end align-items-center">
              <Form.Check
                onChange={handleRequireChange}
                type="switch"
                id="custom-switch"
                label="Required"
                checked={question.isRequired}
              />
              <Button
                size="lg"
                variant="light"
                className={`${classes.delete} mx-2 pt-0`}
                onClick={handleDeleteQeustion}
              >
                <DeleteSVG />
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Fragment>
  );
};

export default NewQuestion;
