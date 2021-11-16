import { Button, Col } from "react-bootstrap";
import classes from "./Buttons.module.css";
const Buttons = (props) => {
  return (
    <Col className="text-end">
      <Button
        variant="secondary"
        className={`mx-1 ${!props.isDefault && classes["btn-primary"]}`}
      >
        {props.secondary}
      </Button>
      <Button
        variant={!props.isDefault ? "danger" : "primary"}
        className={props.isDefault && classes["btn-primary"]}
      >
        {props.primary}
      </Button>
    </Col>
  );
};

export default Buttons;
