import classes from "./SurveyRow.module.css";
import TableActions from "../../../components/TableActions";
import { Link } from "react-router-dom";
import AuthContext from "../../../store/auth-context";
import { useContext } from "react";
import { useHistory } from "react-router-dom";

const SurveyRow = (props) => {
  console.log(props.search);
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const { user } = authContext;

  const handleEdit = (id) => {
    history.push(`/surveys/${id}/edit`);
  };

  const handleView = (id) => {
    history.push(`/surveys/${id}`);
  };

  const handleAnswer = (id) => {
    history.push(`/surveys/${id}/answer`);
  };

  return (
    <tbody>
      {props.surveys.length > 0 &&
        props.surveys.map((survey) => {
          const { title, status, responseNumber, createdDate, endDate, id } =
            survey;
          if (
            (props.filter && status == props.filter) ||
            (props.search && title.startsWith(props.search)) ||
            props.search == "" ||
            props.filter == "All"
          ) {
            return (
              <tr key={id}>
                <td className={classes.title}>
                  {!user.isStudent && (
                    <Link to={`/surveys/${id}`}>{title}</Link>
                  )}
                  {user.isStudent && (
                    <Link
                      style={
                        status == "Answered" ? { pointerEvents: "none" } : {}
                      }
                      to={`/surveys/${id}/answer`}
                    >
                      {title}
                    </Link>
                  )}
                </td>
                <td>{status}</td>
                {responseNumber != undefined && <td>{responseNumber}</td>}
                {createdDate && <td>{createdDate}</td>}
                {endDate && <td>{endDate}</td>}
                <td>
                  {!user.isStudent && (
                    <TableActions
                      onView={handleView.bind(null, id)}
                      isDisabled={status === "Closed" || status === "Published"}
                      onEdit={handleEdit.bind(null, id)}
                    />
                  )}
                  {user.isStudent && (
                    <TableActions
                      isAnswered={status === "Answered"}
                      onAnswer={handleAnswer.bind(null, id)}
                    />
                  )}
                </td>
              </tr>
            );
          }
        })}
    </tbody>
  );
};

export default SurveyRow;
