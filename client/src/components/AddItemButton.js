import classes from "./Buttons.module.css";
import { Button } from "react-bootstrap";
import { ReactComponent as AddItemSVG } from "../resources/add-item.svg";

const PrimaryButton = (props) => {
  return (
    <Button
      variant="outline-primary"
      className={`${classes["btn-outline-primary"]} d-flex align-items-center py-2`}
      onClick={props.onClick}
    >
      <AddItemSVG
        className={`${classes["add-item-icon"]} me-2`}
        width="20px"
        height="21px"
      />
      {props.buttonText || props.children}
    </Button>
  );
};

export default PrimaryButton;
