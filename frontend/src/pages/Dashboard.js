import React, {
  useEffect,
  useState
} from "react";

import api from "../api/axios";

import {
  HiOutlineCube,
  HiOutlineCollection,
  HiOutlineSearch,
  HiOutlineExclamationCircle
} from "react-icons/hi";

import "../styles/Dashboard.css";

function Dashboard() {

  const [stats, setStats] =
    useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {

    try {

      const res =
        await api.get("stats/");

      setStats(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const statusDistribution =
    stats?.status_distribution || {};

  const locationHotspots =
    stats?.location_hotspots || [];

  const suspiciousEvents =
    stats?.recent_suspicious_events || [];

  const maxLocationScans =
    Math.max(
      ...locationHotspots.map((item) => item.total),
      1
    );

  return (

    <div className="dashboard-page">

      {/* HEADER */}

      <div className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Monitor products, scans,
            serial activity and security
            insights in real-time.
          </p>

        </div>

      </div>

      {/* STATS */}

      {
        stats && (

          <div className="stats-grid">

            {/* PRODUCTS */}

            <div className="stats-card">

              <div className="stats-icon blue">

                <HiOutlineCube />

              </div>

              <div>

                <h3>
                  Total Products
                </h3>

                <h2>
                  {stats.total_products}
                </h2>

              </div>

            </div>

            {/* SERIALS */}

            <div className="stats-card">

              <div className="stats-icon purple">

                <HiOutlineCollection />

              </div>

              <div>

                <h3>
                  Total Serials
                </h3>

                <h2>
                  {stats.total_serials}
                </h2>

              </div>

            </div>

            {/* SCANS */}

            <div className="stats-card">

              <div className="stats-icon cyan">

                <HiOutlineSearch />

              </div>

              <div>

                <h3>
                  Total Scans
                </h3>

                <h2>
                  {stats.total_scans}
                </h2>

              </div>

            </div>

            {/* SUSPECT */}

            <div className="stats-card warning">

              <div className="stats-icon red">

                <HiOutlineExclamationCircle />

              </div>

              <div>

                <h3>
                  Suspect Serials
                </h3>

                <h2 className="danger-text">
                  {stats.suspect_serials}
                </h2>

              </div>

            </div>

          </div>

        )
      }

      {
        stats && (

          <div className="dashboard-insights">

            <div className="insight-panel">

              <div className="insight-header">
                <h2>Status Distribution</h2>
                <p>Current serial state across inventory</p>
              </div>

              <div className="status-breakdown">

                <div className="status-row">
                  <span>ACTIVE</span>
                  <strong>{statusDistribution.ACTIVE || 0}</strong>
                </div>

                <div className="status-row">
                  <span>EXPIRED</span>
                  <strong>{statusDistribution.EXPIRED || 0}</strong>
                </div>

                <div className="status-row danger">
                  <span>RECALLED</span>
                  <strong>{statusDistribution.RECALLED || 0}</strong>
                </div>

              </div>

            </div>

            <div className="insight-panel">

              <div className="insight-header">
                <h2>Location Hotspots</h2>
                <p>Top scan locations by activity</p>
              </div>

              {
                locationHotspots.length > 0
                  ? (
                    <div className="hotspot-list">
                      {locationHotspots.map((item) => (
                        <div
                          className="hotspot-row"
                          key={item.location}
                        >
                          <div>
                            <span>{item.location}</span>
                            <strong>{item.total}</strong>
                          </div>

                          <div className="hotspot-track">
                            <div
                              className="hotspot-bar"
                              style={{
                                width:
                                  `${(item.total / maxLocationScans) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                  : (
                    <p className="empty-insight">
                      No scan locations yet
                    </p>
                  )
              }

            </div>

            <div className="insight-panel wide">

              <div className="insight-header">
                <h2>Recent Suspicious Events</h2>
                <p>Latest invalid or suspect scans</p>
              </div>

              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Serial</th>
                      <th>Result</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th>Time</th>
                    </tr>
                  </thead>

                  <tbody>
                    {
                      suspiciousEvents.length > 0
                        ? suspiciousEvents.map((event, index) => (
                          <tr key={`${event.serial}-${index}`}>
                            <td>{event.serial || "-"}</td>
                            <td>
                              <span
                                className={
                                  event.scan_result === "SUSPECT"
                                    ? "event-pill suspect"
                                    : "event-pill invalid"
                                }
                              >
                                {event.scan_result}
                              </span>
                            </td>
                            <td>{event.serial_status || "-"}</td>
                            <td>{event.location || "-"}</td>
                            <td>
                              {new Date(
                                event.scanned_at
                              ).toLocaleString()}
                            </td>
                          </tr>
                        ))
                        : (
                          <tr>
                            <td
                              className="empty-insight table-empty"
                              colSpan="5"
                            >
                              No suspicious events yet
                            </td>
                          </tr>
                        )
                    }
                  </tbody>
                </table>
              </div>

            </div>

          </div>

        )
      }

    </div>
  );
}

export default Dashboard;
