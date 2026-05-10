import React from "react";

function Sidebar({ setPage, setLoggedIn,currentPage}) {

  const role = localStorage.getItem("role") || "SCANNER";
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
  };

  return (
    <div className="sidebar">

      <h2>SmartTrace</h2>

      <p>👤 {username || "User"} ({role})</p>


      {role === "ADMIN" && (
        <>
        <button
  className={currentPage === "dashboard" ? "active" : ""}
  onClick={() => setPage("dashboard")}
>Dashboard</button>
       <button
  className={currentPage === "generate" ? "active" : ""}
  onClick={() => setPage("generate")}
>
  Generate Batch
</button>

<button
  className={currentPage === "tree" ? "active" : ""}
  onClick={() => setPage("tree")}
>
  Hierarchy Tree
</button>
<button
  onClick={() => setPage("status-management")}
>
  Recall & Status Management
</button>
    </>
      )}
        {/* 👥 COMMON FOR ALL */}
  <button
  className={currentPage === "scan" ? "active" : ""}
  onClick={() => setPage("scan")}
>
    Scan & Verify
  </button>

  <button
  className={currentPage === "history" ? "active" : ""}
  onClick={() => setPage("history")}
>
    Scan History
  </button>

  <hr style={{ margin: "20px 0" }} />

  <button onClick={handleLogout} style={{ background: "#dc2626" }}>
    Logout
  </button>

</div>

  );
}

export default Sidebar;