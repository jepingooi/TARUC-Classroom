import { ReactComponent as ViewSVG } from "../resources/icon-view.svg";
import { ReactComponent as EditSVG } from "../resources/icon-edit.svg";
import { ReactComponent as DeleteSVG } from "../resources/icon-delete.svg";
import classes from "./table-actions.module.css";

const TableActions = () => {
  return (
    <div className="d-flex justify-content-evenly">
      <ViewSVG className={classes.hover} />
      <EditSVG className={classes.hover} />
      <DeleteSVG className={classes.hover} />
    </div>
  );
};

export default TableActions;
