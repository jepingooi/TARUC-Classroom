import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import classes from "./Filters.module.css";

const Filters = (props) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  return (
    <div>
      {props.filters.map((filter, index) => {
        const isActive = queryParams.get("filter") === filter ? "dark" : "";

        return (
          <NavLink
            key={index}
            to={`/surveys?filter=${filter}`}
            className={`mx-3 ${
              queryParams.get("filter") === null && filter === "All"
                ? classes.dark
                : classes.link
            } ${isActive ? classes.dark : classes.link} ${isActive}`}
          >
            {filter}
          </NavLink>
        );
      })}
    </div>
  );
};

export default Filters;
