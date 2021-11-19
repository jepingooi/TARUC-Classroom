import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import classes from "./Filters.module.css";

const Filters = (props) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  return (
    <div>
      {props.filters.map((filter) => {
        const isActive =
          queryParams.get("filter") === filter.filterText ? "dark" : "";
        return (
          <NavLink
            key={filter.id}
            to={`/surveys?filter=${filter.filterText}`}
            className={`mx-3 ${
              isActive ? classes.dark : classes.link
            } ${isActive}`}
          >
            {filter.filterText}
          </NavLink>
        );
      })}
    </div>
  );
};

export default Filters;
