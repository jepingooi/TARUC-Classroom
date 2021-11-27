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

const NewQuestion = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [options, setOptions] = useState([]);
  const questionRef = useRef(null);
  const optionRef = useRef(null);

  useEffect(() => {
    props.onChange(question.id, question);
  }, [question]);

  useEffect(() => {
    if (question.type !== "Paragraph") {
      setQuestion((prevState) => {
        return { ...prevState, options };
      });
    }
  }, [options]);

  const handleTypeChange = () => {
    setQuestion((prevState) => {
      let { options: oldOptions, ...newQuestion } = prevState;

      if (questionRef.current.value === "Paragraph") {
        return { ...newQuestion, type: questionRef.current.value };
      } else {
        if (oldOptions === undefined) {
          return { ...prevState, options, type: questionRef.current.value };
        } else {
          return {
            ...prevState,
            options: oldOptions,
            type: questionRef.current.value,
          };
        }
      }
    });
  };

  const handleQuestionChange = (e) => {
    setQuestion((prevState) => {
      return { ...prevState, question: e.target.value };
    });
  };

  const handleRequiredChange = (e) => {
    setQuestion((prevState) => {
      return { ...prevState, isRequired: e.target.checked };
    });
  };

  const handleRemoveOption = (removeOption) => {
    setOptions((prevState) => {
      return prevState.filter((option) => {
        return option != removeOption;
      });
    });
  };

  const handleAddOptions = () => {
    const { current: text } = optionRef;
    if (text.value != "" && !options.includes(text.value)) {
      setOptions((prevState) => {
        return [...prevState, text.value];
      });
    }
    optionRef.current.value = "";
  };

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} md={4}>
        {options.map((option, index) => {
          return (
            <div key={index} className="d-flex align-items-center">
              <Form.Check
                type={optionType}
                label={option}
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
            onClick={handleAddOptions}
          >
            Add
          </Button>
        </InputGroup>
      </Col>
    );
  };

  return (
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
            onChange={handleRequiredChange}
            type="switch"
            id="custom-switch"
            label="Required"
          />
          <Button
            size="lg"
            variant="light"
            className={`${classes.delete} mx-2 pt-0`}
            onClick={props.onDelete}
          >
            <DeleteSVG />
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default NewQuestion;
