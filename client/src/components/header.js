import Button from "./Button";
import { Container, Nav, Navbar } from "react-bootstrap";
import TarucLogo from "../resources/TARUCLogo.png";
import classes from "./header.module.css";
import { NavLink, Link } from "react-router-dom";
import { useHistory } from "react-router";
import { useContext } from "react";
import AuthContext from "../store/auth-context";

const Header = () => {
  const authContext = useContext(AuthContext);

  const isLoggedIn = authContext.isLoggedIn;
  const history = useHistory();
  const logoutHandler = () => {
    authContext.logout();
    history.push("/login");
  };

  const loginHandler = () => {};

  return (
    <Navbar
      className={classes.navbar}
      variant="dark"
      style={{ height: "70px" }}
    >
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
        {isLoggedIn && (
          <Nav className="me-auto">
            <NavLink className="nav-link" to="/videoConferencing">
              Video Conferencing
            </NavLink>
            {/* <NavLink className="nav-link" to="/exams">
              Exams
            </NavLink> */}
            <NavLink className="nav-link" to="/surveys">
              Surveys
            </NavLink>
          </Nav>
        )}

        {isLoggedIn && (
          <Button variant="light" onClick={logoutHandler}>
            Logout
          </Button>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
