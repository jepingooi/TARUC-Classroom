import { Row, Col } from "react-bootstrap";
import Filters from "./Filters";
import PrimaryButton from "./AddItemButton";
import SearchBar from "./SearchBar";
import AuthContext from "../store/context";
import { useContext } from "react";
const ActionBar = (props) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;
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
          {!user.isStudent && <Filters filters={props.filterList}></Filters>}
          {user.isStudent && <Filters filters={props.studentFilter}></Filters>}
        </div>
      </Col>
      <Col className="d-flex justify-content-end">
        <SearchBar text={"Search Survey..."} onChange={props.onSearch} />
      </Col>
    </Row>
  );
};

export default ActionBar;
