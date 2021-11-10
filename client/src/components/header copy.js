import { Container, Nav, Navbar, Form, Button } from "react-bootstrap";
import TarucLogo from "../resources/TARUCLogo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import classes from "./header.module.css";
import { NavLink, Link } from "react-router-dom";

const Header = () => {
  return (
    <Navbar className={classes.navbar} variant="dark">
      <Container>
        <Link
          to="/videoConferencing"
          className={`${classes.navbar} navbar-brand mx-3`}
        >
          <img
            alt=""
            src={TarucLogo}
            width="30"
            height="30"
            className={`${classes.img} d-inline-block align-center`}
          />{" "}
          TARUC Classroom
        </Link>
        <Nav className="me-auto">
          <NavLink className="nav-link" to="/videoConferencing">
            Video Conferencing
          </NavLink>
          <NavLink className="nav-link" to="/exams">
            Exams
          </NavLink>
          <NavLink className="nav-link" to="/surveys">
            Surveys
          </NavLink>
        </Nav>
        <Form className="d-flex">
          <Button>Logout</Button>
        </Form>
      </Container>
    </Navbar>
  );
};

export default Header;
