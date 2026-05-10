import React from "react";
import Sidebar from "./Sidebar";

function Layout({ setPage, setLoggedIn,page,children }) {
  return (
    <div className="layout">
      <Sidebar setPage={setPage}  setLoggedIn={setLoggedIn} currentPage={page}/>

      <div className="content">
        {children}
      </div>
    </div>
  );
}

export default Layout;