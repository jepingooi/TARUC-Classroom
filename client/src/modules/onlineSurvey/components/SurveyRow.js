import classes from "./SurveyRow.module.css";
import TableActions from "../../../components/TableActions";
import { Link } from "react-router-dom";
import AuthContext from "../../../store/context";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);

const SurveyRow = (props) => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const { user, setSurvey, setSurveyStatus } = authContext;

  const handleEdit = (id, status) => {
    setSurvey(id);
    setSurveyStatus(status);
    history.push(`/surveys/${id}/edit`);
  };

  const handleView = (id, status) => {
    setSurvey(id);
    setSurveyStatus(status);
    history.push(`/surveys/${id}`);
  };

  const handleAnswer = (id) => {
    setSurvey(id);
    history.push(`/surveys/${id}`);
  };

  const handleDelete = async (survey) => {
    props.onDelete(survey);
  };

  return (
    <tbody>
      {props.surveys.length > 0 &&
        props.surveys.map((survey) => {
          const { title, status, responseNumber, createdDate, endDate, id } =
            survey;
          if (
            (props.filter && status == props.filter) ||
            (props.search &&
              title.toLowerCase().startsWith(props.search.toLowerCase())) ||
            props.search == "" ||
            props.filter == "All"
          ) {
            return (
              <tr key={id}>
                <td className={classes.title}>
                  {!user.isStudent && (
                    <Link
                      className={classes.link}
                      to={`/surveys/${id}`}
                      onClick={() => {
                        setSurvey(id);
                        setSurveyStatus(status);
                      }}
                    >
                      {title}
                    </Link>
                  )}
                  {user.isStudent && (
                    <Link
                      className={`${classes.link} ${
                        status == "Answered" ? classes.disabled : {}
                      }`}
                      onClick={() => {
                        setSurvey(id);
                        setSurveyStatus(status);
                      }}
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
                      onView={handleView.bind(null, id, status)}
                      isDisabled={status === "Closed" || status === "Published"}
                      onEdit={handleEdit.bind(null, id, status)}
                      onDelete={handleDelete.bind(null, { id, title })}
                    />
                  )}
                  {user.isStudent && (
                    <TableActions
                      isAnswered={status === "Answered"}
                      onAnswer={handleAnswer.bind(null, id, status)}
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
