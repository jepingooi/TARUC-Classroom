import classes from "./SurveyRow.module.css";
import TableActions from "../../../components/TableActions";
import { Link } from "react-router-dom";
import AuthContext from "../../../store/auth-context";
import { useContext } from "react";
import { useHistory } from "react-router-dom";

const SurveyRow = (props) => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const { user } = authContext;

  const handleEdit = (id) => {
    history.push(`/surveys/${id}/edit`);
  };

  return (
    <tbody>
      {props.surveys.length > 0 &&
        props.surveys.map((survey) => {
          const { title, status, responseNumber, createdDate, endDate, id } =
            survey;

          return (
            <tr key={id}>
              <td className={classes.title}>
                <Link to="/">{title}</Link>
              </td>
              <td>{status}</td>
              {responseNumber != undefined && <td>{responseNumber}</td>}
              {createdDate && <td>{createdDate}</td>}
              {endDate && <td>{endDate}</td>}
              <td>
                {!user.isStudent && (
                  <TableActions
                    isDisabled={status === "Closed" || status === "Published"}
                    onEdit={handleEdit.bind(null, id)}
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
