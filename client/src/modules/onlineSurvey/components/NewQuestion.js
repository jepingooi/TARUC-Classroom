import { Container, Row, Col } from "react-bootstrap";

const NewQuestion = () => {
  return (
    <Container className={`p-4 border border-1 rounded shadow-sm`}>
      <Row>
        <Col></Col>
        <Col></Col>
      </Row>
      <Row>
        <Col></Col>
      </Row>
      <Row>
        <Col className="text-right"></Col>
      </Row>
    </Container>
  );
};

export default NewQuestion;
