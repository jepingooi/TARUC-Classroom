import {
  Container,
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
import { useState, useRef } from "react";

const NewQuestion = (props) => {
  const [question, setQuestion] = useState(props.question);
  const [options, setOptions] = useState([]);
  const questionRef = useRef(null);
  const optionRef = useRef(null);

  console.log(question);
  const handleTypeChange = () => {
    setQuestion((prevState) => {
      let { options, ...newQuestion } = prevState;

      if (questionRef.current.value === "Paragraph") {
        console.log("removing options.");
        return { ...newQuestion, type: questionRef.current.value };
      } else {
        console.log("adding options.");
        return { ...prevState, options, type: questionRef.current.value };
      }
    });
  };

  const handleRemoveOption = (removeOption) => {
    setOptions((prevState) => {
      return prevState.filter((option) => {
        return option != removeOption;
      });
    });
    setQuestion((prevState) => {
      return { ...prevState, options };
    });
  };

  const handleAddOptions = () => {
    const { current: text } = optionRef;
    if (text.value != "" && !options.includes(text.value)) {
      setOptions((prevState) => {
        return [...prevState, text.value];
      });
    }
  };

  const renderOptions = (optionType) => {
    return (
      <Col key={`default-radio`} className="my-3" md={3}>
        {options.map((option, index) => {
          return (
            <div key={index} className="d-flex align-items-center">
              <Form.Check
                type={optionType}
                label={option}
                name="group"
                id={`option-${index}`}
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

        <InputGroup>
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
        <Col md={5}>
          <Form.Control
            placeholder="Question"
            size="lg"
            type="text"
            className={`${classes.question}`}
          />
        </Col>

        <Col className="text-right" md={{ span: 3, offset: 4 }}>
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
          <Form.Check type="switch" id="custom-switch" label="Required" />
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
