import { ReactComponent as ViewSVG } from "../resources/icon-view.svg";
import { ReactComponent as EditSVG } from "../resources/icon-edit.svg";
import { ReactComponent as DeleteSVG } from "../resources/icon-delete.svg";
import { ReactComponent as DisabledEditSVG } from "../resources/icon-edit-disabled.svg";
import classes from "./TableActions.module.css";
import { Button, ButtonGroup } from "react-bootstrap";
import AuthContext from "../store/auth-context";
import { useContext, Fragment } from "react";

const TableActions = (props) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;
  return (
    <div className="d-flex justify-content-evenly">
      <ButtonGroup className={classes["bg-none"]}>
        {!user.isStudent && (
          <Fragment>
            <Button variant="light">
              <ViewSVG className={classes.hover} onClick={props.onView} />
            </Button>
            <Button
              variant="light"
              disabled={props.isDisabled}
              style={props.isDisabled ? { backgroundColor: "transparent" } : {}}
            >
              {props.isDisabled && <DisabledEditSVG />}
              {!props.isDisabled && (
                <EditSVG className={classes.hover} onClick={props.onEdit} />
              )}
            </Button>

            <Button variant="light">
              <DeleteSVG className={classes.hover} onClick={props.onDelete} />
            </Button>
          </Fragment>
        )}

        {user.isStudent && (
          <Fragment>
            <Button
              variant="light"
              disabled={props.isAnswered}
              style={props.isAnswered ? { backgroundColor: "transparent" } : {}}
            >
              {props.isAnswered && <DisabledEditSVG />}
              {!props.isAnswered && (
                <EditSVG className={classes.hover} onClick={props.onAnswer} />
              )}
            </Button>
          </Fragment>
        )}
      </ButtonGroup>
    </div>
  );
};

export default TableActions;
