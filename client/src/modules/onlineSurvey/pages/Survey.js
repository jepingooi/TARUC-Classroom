import React, { Fragment } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Filters from "../components/Filters";
import CustomButton from "../components/Button";
import CustomTable from "../../../components/Table";
import SearchBar from "../components/SearchBar";
import SurveyList from "../components/SurveryList";
import { useHistory } from "react-router-dom";

const filterList = [
  {
    id: "f1",
    filterText: "All",
  },
  {
    id: "f2",
    filterText: "Published",
  },
  ,
  {
    id: "f3",
    filterText: "Closed",
  },
  ,
  {
    id: "f4",
    filterText: "Drafted",
  },
];

const headerList = [
  { id: "h1", headerText: "Title" },
  { id: "h2", headerText: "Status" },
  { id: "h3", headerText: "Responses" },
  { id: "h4", headerText: "Start Date" },
  { id: "h5", headerText: "Actions" },
];

const Survey = () => {
  const history = useHistory();
  const clickHandler = () => {
    history.push("/surveys/new");
  };
  return (
    <Fragment>
      <Container className="my-3">
        <Row className="d-flex align-items-center py-3">
          <Col>
            <h1 className="display-5">Your Survey</h1>
          </Col>
        </Row>
        <Row className="d-flex align-items-center justify-content-center py-3">
          <Col>
            <div className="d-flex align-items-center">
              <CustomButton onClick={clickHandler}>Add Survey</CustomButton>
              <Filters filters={filterList}></Filters>
            </div>
          </Col>
          <Col className="d-flex justify-content-end">
            <SearchBar text={"Search Survey..."} />
          </Col>
        </Row>
        <Row className="py-3">
          <Col>
            <CustomTable headers={headerList}>
              <SurveyList></SurveyList>
            </CustomTable>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Survey;
