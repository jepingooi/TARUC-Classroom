import React, { useEffect, useState, Fragment } from "react";

import { firebaseConfig } from "../../../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import classes from "./survey-list.module.css";
import TableActions from "../../../components/TableActions";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SurveyList = () => {
  const [surveys, setSurveys] = useState([]);

  const fetchSurveys = async () => {
    const surveyCollection = collection(db, "surveys");
    const surveySnapshot = await getDocs(surveyCollection);
    const surveyList = surveySnapshot.docs.map((doc) => doc.data());

    console.log(surveySnapshot.docs);
    console.log(surveyList);
    setSurveys(surveyList);
    return surveyList;
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return (
    <tbody>
      {surveys.map((data) => {
        return (
          <tr>
            <td className={classes.title}>{data.title}</td>
            <td>{data.status}</td>
            <td>{data.responses.length}</td>
            <td>{data.startDate.toDate().toDateString()}</td>
            <td>
              <TableActions />
            </td>
          </tr>
        );
      })}
    </tbody>
  );
};

export default SurveyList;
