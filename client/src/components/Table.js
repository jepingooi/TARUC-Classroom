import { Table } from "react-bootstrap";
import classes from "./Table.module.css";

const CustomTable = (props) => {
  return (
    <div className={`${classes.scroll} shadow-md`}>
      <Table striped hover>
        <thead className={classes["table-header"]}>
          <tr>
            {props.headers.map((header) => {
              return <th key={header.id}>{header.headerText}</th>;
            })}
          </tr>
        </thead>
        {props.children}
      </Table>
    </div>
  );
};

export default CustomTable;
