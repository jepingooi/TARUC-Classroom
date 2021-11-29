import classes from "./SurveyRow.module.css";
import TableActions from "../../../components/TableActions";
import { Link } from "react-router-dom";
import AuthContext from "../../../store/auth-context";
import { useContext, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  updateDoc,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyRow = (props) => {
  const authContext = useContext(AuthContext);
  const history = useHistory();
  const { user, setSurvey } = authContext;

  const handleEdit = (id) => {
    history.push(`/surveys/${id}/edit`);
    setSurvey(id);
  };

  const handleView = (id) => {
    history.push(`/surveys/${id}`);
    setSurvey(id);
  };

  const handleAnswer = (id) => {
    history.push(`/surveys/${id}/answer`);
    setSurvey(id);
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
                    <Link className={classes.link} to={`/surveys/${id}`}>
                      {title}
                    </Link>
                  )}
                  {user.isStudent && (
                    <Link
                      className={`${classes.link} ${
                        status == "Answered" ? classes.disabled : {}
                      }`}
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
                      onDelete={handleDelete.bind(null, { id, title })}
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
