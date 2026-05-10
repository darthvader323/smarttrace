import React, { useState } from "react";
import api from "../api/axios";

function StatusManagement() {

  const [serial, setSerial] = useState("");
  const [status, setStatus] = useState("RECALLED");
  const [bulkUpdate, setBulkUpdate] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdate = async () => {

    setMessage("");
    setError("");

    // Validation
    if (!serial.trim()) {
      setError("Please enter a serial");
      return;
    }

    try {

      const endpoint = bulkUpdate
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

    <div className="card">

      <h2>Product Status Management</h2>

      <input
        type="text"
        placeholder="Enter Serial"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
      />

      <select
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

      <div
        style={{
          marginTop: "10px",
          marginBottom: "10px"
        }}
      >

        <label>

          <input
            type="checkbox"
            checked={bulkUpdate}
            onChange={(e) =>
              setBulkUpdate(e.target.checked)
            }
          />

          {" "}
          Apply to entire hierarchy

        </label>

      </div>

      <button
        className="action"
        onClick={handleUpdate}
      >
        Update Status
      </button>

      {message && (

        <p
          style={{
            color: "green",
            marginTop: "10px"
          }}
        >
          {message}
        </p>

      )}

      {error && (

        <p
          style={{
            color: "red",
            marginTop: "10px"
          }}
        >
          {error}
        </p>

      )}

    </div>
  );
}

export default StatusManagement;