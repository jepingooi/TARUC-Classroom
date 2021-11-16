import { Row, Col } from "react-bootstrap";

const Heading = (props) => {
  return (
    <Row className="d-flex align-items-center py-3">
      <Col>
        <h1 className="display-5">{props.text}</h1>
      </Col>
    </Row>
  );
};

export default Heading;
