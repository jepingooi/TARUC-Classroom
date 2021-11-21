import { Row, Col } from "react-bootstrap";
import Filters from "./Filters";
import PrimaryButton from "./AddItemButton";
import SearchBar from "./SearchBar";

const ActionBar = (props) => {
  return (
    <Row className="d-flex align-items-center justify-content-center py-3">
      <Col>
        <div className="d-flex align-items-center">
          {!props.isStudent && (
            <PrimaryButton
              buttonText={props.buttonText}
              onClick={props.onClick}
            />
          )}
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
