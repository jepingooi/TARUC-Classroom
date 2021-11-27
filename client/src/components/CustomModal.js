import { Button, Modal } from "react-bootstrap";
import classes from "./CustomModal.module.css";
const ErrorModal = (props) => {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      aria-labelledby="contained-modal-title-vcenter"
      className={
        props.isSuccess ? classes["modal-success"] : classes["modal-error"]
      }
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{props.children}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={props.isSuccess ? "outline-success" : "outline-danger"}
          onClick={props.onHide}
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
