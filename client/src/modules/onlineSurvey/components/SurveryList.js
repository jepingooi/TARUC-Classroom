import React, { useEffect, useState, useCallback } from "react";

import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import classes from "./survey-list.module.css";
import TableActions from "./TableActions";
import { Link } from "react-router-dom";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyList = () => {
  const [surveys, setSurveys] = useState([
    {
      id: "",
      data: {},
    },
  ]);

  const fetchSurveys = useCallback(async () => {
    const surveyCollection = collection(db, "surveys");
    const surveySnapshot = await getDocs(surveyCollection);
    const surveyList = surveySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        data: doc.data(),
      };
    });

    console.log(surveySnapshot.docs);
    console.log(surveyList);
    setSurveys(surveyList);
    return surveyList;
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return (
    <tbody>
      {surveys.map((doc) => {
        return (
          <tr key={doc.id}>
            {/* <td className={classes.title}>
              <Link to="/">{doc.data.title}</Link>
            </td>
            <td>{doc.data.status}</td>
            <td>{doc.data.responses.length}</td>
            <td>{doc.data.startDate.toDate().toDateString()}</td>
            <td>
              <TableActions isClosed={doc.data.status == "closed"} />
            </td> */}
          </tr>
        );
      })}
    </tbody>
  );
};

export default SurveyList;
