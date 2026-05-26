import React, { useState } from "react";
import api from "../api/axios";
import "../styles/FeaturePages.css";

function StatusManagement() {

  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState("RECALLED");
  const [serialLevel, setSerialLevel] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchSerialLevel = async (serialText) => {
    try {
      const response = await api.get("serials/", {
        params: { search: serialText }
      });
      const exactMatch = response.data.find(
        (item) => item.serial === serialText
      );
      return exactMatch?.level || null;
    } catch {
      return null;
    }
  };

  const handleUpdate = async () => {

    setMessage("");
    setError("");

    // Validation
    if (!serial.trim()) {
      setError("Please enter a serial");
      return;
    }

    let useBulk = false;

    if (!serialLevel) {
      const level = await fetchSerialLevel(serial.trim());
      setSerialLevel(level);
      if (level === "SECONDARY" || level === "TERTIARY") {
        useBulk = true;
      }
    }

    try {
      const endpoint = useBulk
        ? "bulk-update-status/"
        : "update-status/";

      const response = await api.post(endpoint, {
        serial,
        status
      });

      setMessage(response.data.message);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Failed to update status"
      );
    }
  };

  return (

    <div className="feature-page">

      <div className="feature-header">
        <h1>Recall & Status</h1>
        <p>Update one serial or apply a status change across its hierarchy.</p>
      </div>

      <div className="feature-panel">

        <div className="feature-form">

          <input
            className="feature-input"
            type="text"
            placeholder="Enter serial"
            value={serial}
            onChange={(e) => {
              setSerial(e.target.value);
              setSerialLevel(null);
            }}
          />

          <select
            className="feature-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="ACTIVE">
              ACTIVE
            </option>

            <option value="EXPIRED">
              EXPIRED
            </option>

            <option value="RECALLED">
              RECALLED
            </option>
          </select>

          {serialLevel && (
            <p className="status-note">
              {serialLevel === "SECONDARY" || serialLevel === "TERTIARY"
                ? "This is a parent package. All contained items will be updated too."
                : "This is a primary unit. Only this serial will be updated."}
            </p>
          )}

          <button
            className="primary-action"
            onClick={handleUpdate}
          >
            Update Status
          </button>

        </div>

        {message && (
          <p className="alert success">
            {message}
          </p>
        )}

        {error && (
          <p className="alert error">
            {error}
          </p>
        )}

      </div>

    </div>
  );
}

export default StatusManagement;
