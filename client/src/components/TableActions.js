import { ReactComponent as ViewSVG } from "../resources/icon-view.svg";
import { ReactComponent as EditSVG } from "../resources/icon-edit.svg";
import { ReactComponent as DeleteSVG } from "../resources/icon-delete.svg";
import { ReactComponent as DisabledEditSVG } from "../resources/icon-edit-disabled.svg";
import classes from "./TableActions.module.css";
import { Button, ButtonGroup } from "react-bootstrap";
import AuthContext from "../store/context";
import { useContext, Fragment } from "react";

const TableActions = (props) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  return (
    <div className="d-flex justify-content-evenly">
      <ButtonGroup className={classes["bg-none"]}>
        {!user.isStudent && (
          <Fragment>
            <Button variant="light" onClick={props.onView}>
              <ViewSVG className={classes.hover} />
            </Button>
            <Button
              variant="light"
              disabled={props.isDisabled}
              style={props.isDisabled ? { backgroundColor: "transparent" } : {}}
              onClick={props.onEdit}
            >
              {props.isDisabled && <DisabledEditSVG />}
              {!props.isDisabled && <EditSVG className={classes.hover} />}
            </Button>

            <Button variant="light" onClick={props.onDelete}>
              <DeleteSVG className={classes.hover} />
            </Button>
          </Fragment>
        )}

        {user.isStudent && (
          <Fragment>
            <Button
              className={`${classes["btn-text"]} d-flex align-items-center`}
              variant="light"
              disabled={props.isAnswered}
              style={props.isAnswered ? { backgroundColor: "transparent" } : {}}
              onClick={props.onAnswer}
            >
              {props.isAnswered && <DisabledEditSVG />}
              {!props.isAnswered && <EditSVG className={classes.hover} />}
              Answer
            </Button>
          </Fragment>
        )}
      </ButtonGroup>
    </div>
  );
};

export default TableActions;
