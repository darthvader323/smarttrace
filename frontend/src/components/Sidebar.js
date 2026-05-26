import React from "react";
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineSearch,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineShieldCheck,
  HiOutlineViewList
} from "react-icons/hi";
import { TbHierarchy3 } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import "../styles/Sidebar.css";

function Sidebar({ setLoggedIn }) {
  const role = localStorage.getItem("role") || "SCANNER";
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
  };

  const activeClass = ({ isActive }) =>
    isActive ? "menu-btn active" : "menu-btn";

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="logo-box">
          <HiOutlineShieldCheck />
        </div>
        <div>
          <h2>SmartTrace</h2>
          <p className="role-text">Trace & Verification System</p>
        </div>
      </div>

      <div className="user-card">
        <div className="avatar">{username?.charAt(0).toUpperCase()}</div>
        <div>
          <h4>{username || "User"}</h4>
          <p>{role}</p>
        </div>
      </div>

      <div className="menu-section">
        {role === "ADMIN" && (
          <> 
            <NavLink to="/dashboard" className={activeClass}>
              <HiOutlineHome />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/generate" className={activeClass}>
              <HiOutlineCube />
              <span>Generate Batch</span>
            </NavLink>
            <NavLink to="/tree" className={activeClass}>
              <TbHierarchy3 />
              <span>Hierarchy Tree</span>
            </NavLink>
            <NavLink to="/serials" className={activeClass}>
              <HiOutlineViewList />
              <span>All Serials</span>
            </NavLink>
            <NavLink to="/status-management" className={activeClass}>
              <HiOutlineShieldCheck />
              <span>Recall & Status</span>
            </NavLink>
          </>
        )}

        <NavLink to="/scan" className={activeClass}>
          <HiOutlineSearch />
          <span>Scan & Verify</span>
        </NavLink>

        <NavLink to="/history" className={activeClass}>
          <HiOutlineClock />
          <span>Scan History</span>
        </NavLink>
      </div>

      <div className="logout-section">
        <button className="logout-btn" onClick={handleLogout}>
          <HiOutlineLogout />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
