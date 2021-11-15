import { Row, Col, Button } from "react-bootstrap";
import Filters from "./Filters";
import SearchBar from "./SearchBar";

const ActionBar = (props) => {
  return (
    <Row className="d-flex align-items-center justify-content-center py-3">
      <Col>
        <div className="d-flex align-items-center">
          <Button variant="outline-primary" onClick={props.onClick}>
            {props.buttonText}
          </Button>
          <Filters filters={props.filterList}></Filters>
        </div>
      </Col>
      <Col className="d-flex justify-content-end">
        <SearchBar text={"Search Survey..."} />
      </Col>
    </Row>
  );
};

export default ActionBar;
