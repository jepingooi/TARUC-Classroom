const SearchBar = (props) => {
  return (
    <div className="form-outline">
      <input
        type="search"
        id="form1"
        className="form-control"
        placeholder={props.text}
        aria-label="Search"
      />
    </div>
  );
};

export default SearchBar;
