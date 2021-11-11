import { Table } from "react-bootstrap";
import classes from "./table.module.css";

const CustomTable = (props) => {
  return (
    <Table striped hover>
      <thead className={classes["table-header"]}>
        <tr>
          {props.headers.map((header) => {
            return <th>{header}</th>;
          })}
        </tr>
      </thead>
      {props.children}
    </Table>
  );
};

export default CustomTable;
