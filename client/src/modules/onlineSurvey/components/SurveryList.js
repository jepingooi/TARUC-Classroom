import React, { useEffect, useState, useCallback } from "react";

import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import classes from "./SurveyList.module.css";
import TableActions from "./TableActions";
import { Link } from "react-router-dom";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyList = () => {
  const [surveys, setSurveys] = useState([
    {
      id: "",
      title: "",
      status: "",
      responseNumber: 0,
      startDate: null,
    },
  ]);

  const fetchSurveys = useCallback(async () => {
    const surveyCollection = collection(db, "surveys");
    const surveySnapshot = await getDocs(surveyCollection);
    const surveyList = surveySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        status: data.status,
        responseNumber: data.responses.length,
        startDate: data.startDate.toDate().toDateString(),
      };
    });

    // console.log(surveySnapshot.docs);
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
            <td className={classes.title}>
              <Link to="/">{doc.title}</Link>
            </td>
            <td>{doc.status}</td>
            <td>{doc.responseNumber}</td>
            <td>{doc.startDate}</td>
            <td>
              <TableActions isClosed={doc.status == "Closed"} />
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default SurveyList;
