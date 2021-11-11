import { ReactComponent as ViewSVG } from "../../../resources/icon-view.svg";
import { ReactComponent as EditSVG } from "../../../resources/icon-edit.svg";
import { ReactComponent as DeleteSVG } from "../../../resources/icon-delete.svg";
import { ReactComponent as DisabledEditSVG } from "../../../resources/icon-edit-disabled.svg";

import classes from "./Actions.module.css";
import { Button, ButtonGroup } from "react-bootstrap";

const TableActions = (props) => {
  return (
    <div className="d-flex justify-content-evenly">
      <ButtonGroup>
        <Button variant="light" className={classes["bg-none"]}>
          <ViewSVG className={classes.hover} onClick={props.onView} />
        </Button>
        <Button
          variant="light"
          className={classes["bg-none"]}
          disabled={props.isClosed}
          style={props.isClosed ? { backgroundColor: "transparent" } : {}}
        >
          {props.isClosed && <DisabledEditSVG />}
          {!props.isClosed && (
            <EditSVG className={classes.hover} onClick={props.onView} />
          )}
        </Button>

        <Button variant="light" className={classes["bg-none"]}>
          <DeleteSVG className={classes.hover} onClick={props.onView} />
        </Button>
      </ButtonGroup>
    </div>
  );
};

export default TableActions;
