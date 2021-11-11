import { Button } from "react-bootstrap";

const MyButton = (props) => {
  return (
    <Button size={props.size} variant={props.variant} onClick={props.onClick}>
      {props.children}
    </Button>
  );
};

export default MyButton;
