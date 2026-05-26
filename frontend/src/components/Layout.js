import React from "react";
import Sidebar from "./Sidebar";
import "../styles/Layout.css";

function Layout({ setLoggedIn, children }) {
  return (
    <div className="layout">
      <Sidebar setLoggedIn={setLoggedIn} />
      <div className="content-wrapper">
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Layout;
