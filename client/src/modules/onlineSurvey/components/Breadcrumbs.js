import { Nav, Navbar, Container, Row, Col } from "react-bootstrap";
import { NavLink, useHistory } from "react-router-dom";
import classes from "./Breadcrumbs.module.css";

const Breadcrumbs = (props) => {
  const history = useHistory();
  const { active } = props;
  console.log(props.isPublished);
  return (
    <Container
      fluid
      className={`${classes.bg} align-items-center justify-content-center d-flex`}
    >
      <Nav>
        <NavLink
          className={`${
            active === "preview" ? classes.active : classes.link
          } nav-link`}
          to={`/surveys/${props.id}`}
        >
          Preview
        </NavLink>
        {!props.isPublished && (
          <NavLink
            className={`${
              active === "edit" ? classes.active : classes.link
            } nav-link`}
            to={`/surveys/${props.id}/edit`}
          >
            Edit
          </NavLink>
        )}

        {props.isPublished && (
          <NavLink
            className={` ${
              active === "response" ? classes.active : classes.link
            } nav-link`}
            to={`/surveys/${props.id}/response`}
          >
            Responses
          </NavLink>
        )}
      </Nav>
    </Container>
  );
};

export default Breadcrumbs;
