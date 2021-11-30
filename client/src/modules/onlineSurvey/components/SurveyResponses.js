import Chart from "../components/Chart";
import ParagraphResponse from "../components/ParagraphResponse";
import { Container } from "react-bootstrap";
import classes from "./SurveyResponses.module.css";
import { Fragment } from "react";
const SurveyResponses = (props) => {
  const getPageMargins = () => {
    return `@page { margin: ${10} ${0} ${0} ${0} !important; }`;
  };
  return (
    <Fragment>
      {props.survey.questions &&
        props.survey.questions.map((question, index) => {
          return (
            <Fragment key={index}>
              {index !== 0 && <div className={classes["page-break"]} />}
              {props.print && index == 0 && (
                <h1 className={`text-center`}>{props.survey.title}</h1>
              )}
              <div>
                <Container
                  key={index}
                  className={`${classes.container} p-4 border border-1 rounded shadow-sm my-4`}
                >
                  {question.type !== "Paragraph" ? (
                    <Chart
                      isPrint={props.print}
                      question={question}
                      key={index}
                      index={index}
                      onChange={props.onChange}
                    />
                  ) : (
                    <ParagraphResponse question={question} key={index} />
                  )}
                </Container>
              </div>
            </Fragment>
          );
        })}
    </Fragment>
  );
};

export default SurveyResponses;
