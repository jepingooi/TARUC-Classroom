import React, { useState } from "react";
import { firebaseConfig } from "../firebaseConfig.json";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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
};

export const AuthContextProvider = (props) => {
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState(initialToken);
  const [user, setUser] = useState("");

  const userIsLoggedIn = !!token;

  const loginHandler = (token, user, expirationTime) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    // const remainingTime = calcRemainingTime(expirationTime);

    // setTimeout(logoutHandler, remainingTime);
  };

  const logoutHandler = () => {
    setToken(null);
    localStorage.clear();
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
