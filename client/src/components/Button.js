import { Button } from "react-bootstrap";

const MyButton = (props) => {
  return (
    <Button variant={props.variant} onClick={props.onClick}>
      Logout
    </Button>
  );
};

export default MyButton;
