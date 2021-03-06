import { Table } from "react-bootstrap";
import classes from "./Table.module.css";

const CustomTable = (props) => {
  return (
    <div className={`${classes.scroll} shadow-md`}>
      <Table striped hover>
        <thead className={`${classes["table-header"]} sticky-top`}>
          <tr>
            {props.headers.map((header, index) => {
              return <th key={index}>{header}</th>;
            })}
          </tr>
        </thead>
        {props.children}
      </Table>
    </div>
  );
};

export default CustomTable;
