import React from "react";
import { Button } from "react-bootstrap";

const CustomButton = (props) => {
  return (
    <Button onClick={props.onClick} variant="outline-primary">
      {props.children}
    </Button>
  );
};

export default CustomButton;
