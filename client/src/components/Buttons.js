import { Fragment } from "react";
import { Button, Col } from "react-bootstrap";
import classes from "./Buttons.module.css";
import { ReactComponent as SaveSVG } from "../resources/icon-save.svg";

const Buttons = (props) => {
  return (
    <Col>
      {props.isDefault && (
        <Fragment>
          <Button
            variant="secondary"
            className={`mx-1 shadow-sm`}
            onClick={props.onCancel}
          >
            {props.secondary}
          </Button>
          <Button
            variant={props.variant}
            className={`shadow-sm ${classes["btn-primary"]} `}
            onClick={props.onSave}
          >
            <div className="align-items-center d-flex">
              <SaveSVG width="15px" height="16px" className="me-2" />
              {props.primary}
            </div>
          </Button>
        </Fragment>
      )}
      {!props.isDefault && (
        <Fragment>
          <Button
            variant="secondary"
            className={`mx-1 ${classes["btn-primary"]} shadow-sm`}
          >
            {props.secondary}
          </Button>
          <Button variant="danger" className="shadow-sm">
            {props.primary}
          </Button>
        </Fragment>
      )}
    </Col>
  );
};

export default Buttons;
