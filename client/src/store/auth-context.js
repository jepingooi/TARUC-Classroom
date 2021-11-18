import React, { useState } from "react";

const AuthContext = React.createContext({
  token: "",
  isLoggedIn: false,
  user: {},
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
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState("");

  const userIsLoggedIn = !!token;

  const logoutHandler = () => {
    setToken(null);
    localStorage.clear();
  };

  const loginHandler = (token, user, expirationTime) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    const remainingTime = calcRemainingTime(expirationTime);

    setTimeout(logoutHandler, remainingTime);
  };

  const contextValue = {
    token,
    user,
    isLoggedIn: userIsLoggedIn,
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
