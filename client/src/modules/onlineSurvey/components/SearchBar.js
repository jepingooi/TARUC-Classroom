const SearchBar = (props) => {
  return (
    <div class="form-outline">
      <input
        type="search"
        id="form1"
        class="form-control"
        placeholder={props.text}
        aria-label="Search"
      />
    </div>
  );
};

export default SearchBar;
