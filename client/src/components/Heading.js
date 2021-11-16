import { Row, Col } from "react-bootstrap";
import classes from "./Heading.module.css";
const Heading = (props) => {
  return (
    <Row className="d-flex align-items-center py-3">
      <Col md={3}>
        <h1 className={`display-5`}>{props.children}</h1>
      </Col>
      <Col>{props.buttons}</Col>
    </Row>
  );
};

export default Heading;
