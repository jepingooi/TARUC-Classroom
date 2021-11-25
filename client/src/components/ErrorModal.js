import { Button, Modal } from "react-bootstrap";
import classes from "./ErrorModal.module.css";
const ErrorModal = (props) => {
  return (
    <Modal
      show={props.show}
      onHide={props.onClose}
      aria-labelledby="contained-modal-title-vcenter"
      className={classes.modal}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">Error</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{props.message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-danger" onClick={props.onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorModal;
