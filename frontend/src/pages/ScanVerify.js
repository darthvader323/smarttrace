import React, { useState } from "react";
import api from "../api/axios";

function ScanVerify() {

  const [serial, setSerial] = useState("");
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("Delhi");

  const handleScan = async () => {

    setResult("");
    setMessage("");

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

    } catch (error) {

      setResult("INVALID");

      setMessage(
        error.response?.data?.error || "Verification failed"
      );
    }
  };

  return (

    <div className="card">

      <h2>Scan & Verify</h2>

      <input
        type="text"
        placeholder="Enter Serial"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
      />

      <select
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      >
        <option value="Delhi">Delhi</option>
        <option value="Mumbai">Mumbai</option>
        <option value="Kolkata">Kolkata</option>
        <option value="Bangalore">Bangalore</option>
      </select>

      <button className="action" onClick={handleScan}>
        Verify
      </button>

      <h3>Status:</h3>

      {result && (
        <div
          className={
            result === "VALID"
              ? "status-valid"
              : result === "INVALID"
              ? "status-invalid"
              : result === "RECALLED"
              ? "status-invalid"
              : "status-suspect"
          }
        >
          {result}
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: "10px",
            color:
              result === "VALID"
                ? "green"
                : result === "INVALID"
                ? "red"
                : "#333"
          }}
        >
          {message}
        </p>
      )}

    </div>
  );
}

export default ScanVerify;