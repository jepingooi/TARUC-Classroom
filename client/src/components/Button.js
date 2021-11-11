import { Button } from "react-bootstrap";

const MyButton = (props) => {
  return (
    <Button variant={props.variant} onClick={props.onClick}>
      {props.children}
    </Button>
  );
};

export default MyButton;
