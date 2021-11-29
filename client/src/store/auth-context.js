import React, { useState } from "react";
import { getAuth, signOut } from "firebase/auth";

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  user: {},
  surveyId: "",
  login: (token) => {},
  logout: () => {},
});

const calcRemainingTime = (expirationTime) => {
  const currentTime = new Date().getTime();
  const adjExpirationTime = new Date(expirationTime).getTime();
  const remainingTime = adjExpirationTime - currentTime;

  return remainingTime;
};

export const AuthContextProvider = (props) => {
  const initialToken = localStorage.getItem("token");
  const activeUser = localStorage.getItem("user");
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState(JSON.parse(activeUser));
  const [surveyId, setSurveyId] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const userIsLoggedIn = !!token;

  const setSurvey = (id) => {
    setSurveyId(id);
  };

  const logoutHandler = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("logged out");
      })
      .catch((error) => {
        // An error happened.
      });
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    localStorage.clear();
  };

  const loginHandler = (token, user, expirationTime) => {
    setToken(token);
    setUser(user);
    setIsLoggedIn(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    const remainingTime = calcRemainingTime(expirationTime);

    setTimeout(logoutHandler, remainingTime);
  };

  const contextValue = {
    token,
    user,
    isLoggedIn: userIsLoggedIn,
    surveyId,
    setSurvey,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
