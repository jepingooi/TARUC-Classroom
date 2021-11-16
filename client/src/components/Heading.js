import { Row, Col } from "react-bootstrap";

const Heading = (props) => {
  return (
    <Row className="d-flex align-items-center py-3">
      <Col>
        <h1
          contenteditable={props.editable}
          className={`display-5 ${props.editable ? "px-3 py-2" : ""}`}
        >
          {props.children}
        </h1>
      </Col>
    </Row>
  );
};

export default Heading;
