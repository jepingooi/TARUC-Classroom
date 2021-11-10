import React from "react";
import { Nav } from "react-bootstrap";

const Filters = (props) => {
  return (
    <Nav>
      {props.filters.map((filter) => {
        return (
          <Nav.Item>
            <Nav.Link>{filter}</Nav.Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default Filters;
