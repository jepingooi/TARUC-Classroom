import classes from "./SurveyRow.module.css";
import TableActions from "./Actions";
import { Link } from "react-router-dom";

const SurveyRow = (props) => {
  return (
    <tbody>
      {props.surveys.length > 0 &&
        props.surveys.map((survey) => {
          return (
            <tr key={survey.id}>
              <td className={classes.title}>
                <Link to="/">{survey.title}</Link>
              </td>
              <td>{survey.status}</td>
              <td>{survey.responseNumber}</td>
              <td>{survey.startDate}</td>
              <td>
                <TableActions isClosed={survey.status === "Closed"} />
              </td>
            </tr>
          );
        })}
    </tbody>
  );
};

export default SurveyRow;
