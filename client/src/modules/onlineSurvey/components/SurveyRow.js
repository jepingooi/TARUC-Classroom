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
          return (
            <tr key={survey.id}>
              <td className={classes.title}>
                <Link to="/">{survey.title}</Link>
              </td>
              <td>{survey.status}</td>
              {survey.responseNumber && <td>{survey.responseNumber}</td>}
              {survey.startDate && <td>{survey.startDate}</td>}
              {survey.endDate && <td>{survey.endDate}</td>}
              <td>
                {!user.isStudent && (
                  <TableActions isClosed={survey.status === "Closed"} />
                )}
                {user.isStudent && (
                  <TableActions isAnswered={survey.status === "Answered"} />
                )}
              </td>
            </tr>
          );
        })}
    </tbody>
  );
};

export default SurveyRow;
