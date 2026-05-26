import React, { useState } from "react";
import api from "../api/axios";
import "../styles/FeaturePages.css";

function ScanVerify() {

  const [serial, setSerial] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("Delhi");
  const [tracePath, setTracePath] = useState([]);

  const fetchTracePath = async (serialNumber) => {
    try {
      const response = await api.get(`full-hierarchy/${serialNumber}/`);
      setTracePath(response.data.trace_path || []);
    } catch (error) {
      setTracePath([]);
    }
  };

  const handleScan = async () => {

    setResult("");
    setMessage("");
    setTracePath([]);

    if (!serial) {
      setMessage("Please enter serial");
      return;
    }

    try {

      const response = await api.post("verify-serial/", {
        serial: serial,
        location: location
      });

      setResult(response.data.status);
      setMessage(response.data.message || "");

      if (response.data.status !== "INVALID") {
        await fetchTracePath(serial);
      }

    } catch (error) {

      setResult("INVALID");
      setTracePath([]);

      setMessage(
        error.response?.data?.error || "Verification failed"
      );
    }
  };

  return (

    <div className="feature-page">

      <div className="feature-header">
        <h1>Scan & Verify</h1>
        <p>Check a serial number and record the verification location.</p>
      </div>

      <div className="feature-panel">

        <div className="feature-form">

          <input
            className="feature-input"
            type="text"
            placeholder="Enter serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />

          <select
            className="feature-select"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Bangalore">Bangalore</option>
          </select>

          <button
            className="primary-action"
            onClick={handleScan}
          >
            Verify
          </button>

        </div>

        {(result || message) && (
          <div className="result-panel">

            <h3>Status</h3>

            {result && (
              <div
                className={
                  result === "VALID"
                    ? "status-pill status-valid"
                    : result === "INVALID"
                    ? "status-pill status-invalid"
                    : result === "RECALLED"
                    ? "status-pill status-invalid"
                    : "status-pill status-suspect"
                }
              >
                {result}
              </div>
            )}

            {message && (
              <p
                className={
                  result === "VALID"
                    ? "alert success"
                    : "alert error"
                }
              >
                {message}
              </p>
            )}

          </div>
        )}

        {tracePath.length > 0 && (
          <div className="trace-panel">
            <h3>Red Thread Traceability</h3>
            <ol className="trace-path">
              {tracePath.map((node) => (
                <li key={node.serial}>
                  <strong>{node.serial}</strong>
                  {node.level && ` (${node.level})`}
                </li>
              ))}
            </ol>
          </div>
        )}

      </div>

    </div>
  );
}

export default ScanVerify;
