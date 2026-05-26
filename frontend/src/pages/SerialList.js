import React, { useEffect, useState } from "react";
import api from "../api/axios";
import "../styles/FeaturePages.css";

function SerialList() {
  const [serials, setSerials] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSerials();
  }, []);

  const fetchSerials = async (status = "", searchTerm = "") => {
    setLoading(true);
    setError("");

    try {
      const params = {};

      if (status) {
        params.status = status;
      }

      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await api.get("serials/", { params });
      setSerials(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.error ||
          "Unable to load serials"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    fetchSerials(value, search);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    fetchSerials(statusFilter, value);
  };

  return (
    <div className="feature-page">
      <div className="feature-header">
        <h1>All Serials</h1>
        <p>
          Admin view of all serials with status filters for ACTIVE,
          EXPIRED and RECALLED.
        </p>
      </div>

      <div className="feature-panel wide">
        <div className="feature-row">
          <input
            className="feature-input"
            type="text"
            placeholder="Search serial"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />

          <select
            className="feature-select"
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="EXPIRED">EXPIRED</option>
            <option value="RECALLED">RECALLED</option>
          </select>
        </div>

        {error && <p className="alert error">{error}</p>}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial</th>
                <th>Product</th>
                <th>Level</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Loading serials...
                  </td>
                </tr>
              ) : serials.length > 0 ? (
                serials.map((item) => (
                  <tr key={item.id}>
                    <td>{item.serial}</td>
                    <td>{item.product_name || "-"}</td>
                    <td>{item.level}</td>
                    <td>
                      <span
                        className={
                          item.status === "ACTIVE"
                            ? "status-pill status-valid"
                            : item.status === "RECALLED"
                            ? "status-pill status-invalid"
                            : "status-pill status-suspect"
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    No serials found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SerialList;
