import { Table } from "react-bootstrap";
import classes from "./Table.module.css";

const CustomTable = (props) => {
  return (
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
  );
};

export default CustomTable;