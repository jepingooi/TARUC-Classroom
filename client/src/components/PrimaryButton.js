import classes from "./Buttons.module.css";
import { Button } from "react-bootstrap";

const PrimaryButton = (props) => {
  return (
    <Button
      variant="outline-primary"
      className={classes["btn-outline-primary"]}
      onClick={props.onClick}
    >
      {props.buttonText || props.children}
    </Button>
  );
};

export default PrimaryButton;
