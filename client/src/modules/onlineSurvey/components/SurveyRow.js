import classes from "./SurveyRow.module.css";
import TableActions from "../../../components/TableActions";
import { Link } from "react-router-dom";
import AuthContext from "../../../store/auth-context";
import { useContext } from "react";

const SurveyRow = (props) => {
  const authContext = useContext(AuthContext);
  const { user } = authContext;

  return (
    <tbody>
      {props.surveys.length > 0 &&
        props.surveys.map((survey) => {
          const { title, status, responseNumber, startDate, endDate, id } =
            survey;

          return (
            <tr key={id}>
              <td className={classes.title}>
                <Link to="/">{title}</Link>
              </td>
              <td>{status}</td>
              {responseNumber != undefined && <td>{responseNumber}</td>}
              {startDate && <td>{startDate}</td>}
              {endDate && <td>{endDate}</td>}
              <td>
                {!user.isStudent && (
                  <TableActions
                    isDisabled={status === "Closed" || status === "Published"}
                  />
                )}
                {user.isStudent && (
                  <TableActions isAnswered={status === "Answered"} />
                )}
              </td>
            </tr>
          );
        })}
    </tbody>
  );
};

export default SurveyRow;
