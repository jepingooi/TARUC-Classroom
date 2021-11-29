import classes from "./Buttons.module.css";
import { Button } from "react-bootstrap";
import { ReactComponent as AddItemSVG } from "../resources/icon-add.svg";
import { ReactComponent as UploadSVG } from "../resources/icon-upload.svg";

const PrimaryButton = (props) => {
  return (
    <Button
      variant="outline-primary"
      className={`${classes["btn-outline-primary"]}  py-2 shadow-sm`}
      onClick={props.onClick}
    >
      <div className="d-flex align-items-center">
        {!props.isSave && (
          <AddItemSVG
            className={`${classes["add-item-icon"]} me-2`}
            width="20px"
            height="21px"
          />
        )}

        {props.buttonText || props.children}
      </div>
    </Button>
  );
};

export default PrimaryButton;
