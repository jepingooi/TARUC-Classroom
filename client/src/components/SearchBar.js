import classes from "./SearchBar.module.css";
import { ReactComponent as SearchSVG } from "../resources/search-icon.svg";

const SearchBar = (props) => {
  return (
    <div className="form-outline">
      <input
        type="search"
        id="form1"
        className={`${classes["search-bar"]} form-control`}
        placeholder={props.text}
        aria-label="Search"
      ></input>
    </div>
  );
};

export default SearchBar;
