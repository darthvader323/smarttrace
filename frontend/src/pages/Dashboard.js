import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {

  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("stats/");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>

      <h1>Dashboard</h1>

      {stats && (
        <div style={{display:"flex", gap:"20px", marginTop:"20px"}}>

          <div className="card">
            <h3>Total Products</h3>
            <h2>{stats.total_products}</h2>
          </div>

          <div className="card">
            <h3>Total Serials</h3>
            <h2>{stats.total_serials}</h2>
          </div>

          <div className="card">
            <h3>Total Scans</h3>
            <h2>{stats.total_scans}</h2>
          </div>

          <div className="card">
            <h3>Suspect Serials</h3>
            <h2 style={{color:"red"}}>
              {stats.suspect_serials}
            </h2>
          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;