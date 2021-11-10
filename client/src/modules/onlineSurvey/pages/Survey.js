import React, { Fragment } from "react";
import { Container, Row, Col } from "react-bootstrap";
import Filters from "../components/Filters";
import CustomButton from "../components/Button";
import CustomTable from "../components/Table";
import SearchBar from "../components/SearchBar";

const Survey = (props) => {
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
              <CustomButton>Add Survey</CustomButton>
              <Filters
                filters={["All", "Published", "Closed", "Drafted"]}
              ></Filters>
            </div>
          </Col>
          <Col className="d-flex justify-content-end">
            <SearchBar text={"Search Survey..."} />
          </Col>
        </Row>
        <Row className="py-3">
          <Col>
            <CustomTable
              headers={[
                "Title",
                "Status",
                "Responses",
                "Created Date",
                "Actions",
              ]}
            />
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Survey;
