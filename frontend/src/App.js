import React, { useState,useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import GenerateBatch from "./pages/GenerateBatch";
import ScanVerify from "./pages/ScanVerify";
import ScanHistory from "./pages/ScanHistory";
import RecallStatusManagement from "./pages/RecallStatusManagement";
import "./styles/dashboard.css";
import HierarchyTree from "./pages/HierarchyTree";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(true);
  const [authPage, setAuthPage] = useState("login"); 
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
   setLoading(false);
}, []);

if (loading) return null;


  // 🔐 AUTH FLOW (REPLACE OLD LOGIN CHECK WITH THIS)
  if (!loggedIn) {
    return authPage === "login"
      ? <Login setLoggedIn={setLoggedIn} setPage={setAuthPage} />
      : <Register setPage={setAuthPage} />;
  }

  const renderPage = () => {
    if (page === "generate") return <GenerateBatch />;
    if (page === "scan") return <ScanVerify />;
    if (page === "tree") return <HierarchyTree />;
    if (page === "history") return <ScanHistory />;
    if (page === "status-management") return <RecallStatusManagement />;
    return <Dashboard />;
  };

  return (
    <Layout setPage={setPage} setLoggedIn={setLoggedIn} page={page}>
      {renderPage()}
    </Layout>
  );
}
export default App;