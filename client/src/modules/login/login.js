import React, { Component } from "react";
import axios from "axios";
import { Link, Redirect, withRouter } from "react-router-dom";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      email: "",
    };
  }

  handleInputChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleOnClick = () => {
    const { username, email } = this.state;
    const user = {
      username,
      email,
    };
    axios("http://localhost:3000/videoConferencing")
      .then(function (response) {
        console.log("It worked, response is: ", response);
        this.props.history.push({
          pathname: "/videoConferencing",
        });
      })
      .catch(function () {
        console.log("error");
      });

    this.props.handleNavigation();
  };

  render() {
    return (
      <div>
        <br />
        <div className="container">
          <form onSubmit={this.handleSubmit}>
            <div style={{ width: "30%" }} className="form-group">
              <input
                type="text"
                className="form-control"
                name="username"
                placeholder="Username"
                onChange={this.handleInputChange}
              />
            </div>
            <br />
            <div style={{ width: "30%" }} className="form-group">
              <input
                type="text"
                className="form-control"
                name="email"
                placeholder="Email"
                onChange={this.handleInputChange}
              />
            </div>
            <br />

            <br />
            <div style={{ width: "30%" }}>
              <Link to="/videoConferencing" onClick={this.handleOnClick} className="btn btn-primary">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
