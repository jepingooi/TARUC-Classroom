import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import classes from "./filters.module.css";

const Filters = (props) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  return (
    <div>
      {props.filters.map((f) => {
        const isActive = queryParams.get("filter") == f ? "dark" : "";
        return (
          <NavLink
            to={`/surveys?filter=${f}`}
            className={`mx-3 ${
              isActive ? classes.dark : classes.link
            } ${isActive}`}
          >
            {f}
          </NavLink>
        );
      })}
    </div>
  );
};

export default Filters;
