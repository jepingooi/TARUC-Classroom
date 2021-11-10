import Header from "../components/header copy";
import { Fragment } from "react";

const Layout = (props) => {
  return (
    <Fragment>
      <Header />
      <main>{props.children}</main>
    </Fragment>
  );
};

export default Layout;
