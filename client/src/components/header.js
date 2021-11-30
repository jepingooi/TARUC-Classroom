import { Container, Nav, Navbar, Button } from "react-bootstrap";
import TarucLogo from "../resources/TARUCLogo.png";
import classes from "./Header.module.css";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useHistory } from "react-router";
import { useContext, useState } from "react";
import AuthContext from "../store/context";

const Header = () => {
  const authContext = useContext(AuthContext);
  let location = useLocation();
  const isLoggedIn = authContext.isLoggedIn;
  const [isRegister, setIsRegister] = useState(false);
  const history = useHistory();

  const handleLogout = () => {
    authContext.logout();
    history.push({
      pathname: "/user",
      state: {
        register: false,
      },
    });
  };

  const handleRegister = () => {
    setIsRegister(true);
    history.push({ pathname: "/user", state: { register: true } });
  };

  const handleLogin = () => {
    setIsRegister(false);
    history.push({ pathname: "/user", state: { register: false } });
  };

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
          />
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
            <NavLink className="nav-link" to="/surveys?filter=All">
              Surveys
            </NavLink>
          </Nav>
        )}

        {isLoggedIn && (
          <Button size="md" variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        )}

        {!isLoggedIn &&
          location.state !== undefined &&
          !location.state.register && (
            <Button size="md" variant="outline-light" onClick={handleRegister}>
              Register
            </Button>
          )}
        {!isLoggedIn && location.state === undefined && (
          <Button size="md" variant="outline-light" onClick={handleRegister}>
            Register
          </Button>
        )}
        {!isLoggedIn &&
          location.state !== undefined &&
          location.state.register && (
            <Button size="md" variant="outline-light" onClick={handleLogin}>
              Login
            </Button>
          )}
      </Container>
    </Navbar>
  );
};

export default Header;
