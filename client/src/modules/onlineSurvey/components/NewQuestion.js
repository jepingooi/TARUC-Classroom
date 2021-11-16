import classes from "./NewQuestion.module.css";

const NewQuestion = (props) => {
  return <div className={classes.question}>{props.type}</div>;
};

export default NewQuestion;
