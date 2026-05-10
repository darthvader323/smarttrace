import React, { useEffect, useState } from "react";
import api from "../api/axios";

function ScanHistory() {

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [serialFilter, setSerialFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, serialFilter, locationFilter]);

  const fetchLogs = async () => {

    try {

      const res = await api.get("scan-logs/");

      setLogs(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const applyFilters = () => {

    let filtered = [...logs];

    // Filter by serial
    if (serialFilter.trim()) {

      filtered = filtered.filter((log) =>
        log.serial
          .toLowerCase()
          .includes(serialFilter.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter) {

      filtered = filtered.filter(
        (log) => log.location === locationFilter
      );
    }

    setFilteredLogs(filtered);
  };

  return (

    <div
      className="card"
      style={{ width: "100%" }}
    >

      <h2>Scan History</h2>

      {/* FILTERS */}

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          marginBottom: "20px",
          flexWrap: "wrap"
        }}
      >

        <input
          type="text"
          placeholder="Filter by serial"
          value={serialFilter}
          onChange={(e) =>
            setSerialFilter(e.target.value)
          }
        />

        <select
          value={locationFilter}
          onChange={(e) =>
            setLocationFilter(e.target.value)
          }
        >

          <option value="">
            All Locations
          </option>

          <option value="Delhi">
            Delhi
          </option>

          <option value="Mumbai">
            Mumbai
          </option>

          <option value="Kolkata">
            Kolkata
          </option>

          <option value="Bangalore">
            Bangalore
          </option>

        </select>

      </div>

      {/* TABLE */}

      <table
        style={{
          width: "100%",
          marginTop: "10px",
          borderCollapse: "collapse"
        }}
      >

        <thead>

          <tr>

            <th>Serial</th>
            <th>Location</th>
            <th>Time</th>

          </tr>

        </thead>

        <tbody>

          {filteredLogs.length > 0 ? (

            filteredLogs.map((log, index) => (

              <tr key={index}>

                <td>{log.serial}</td>

                <td>{log.location}</td>

                <td>
                  {new Date(
                    log.scanned_at
                  ).toLocaleString()}
                </td>

              </tr>

            ))

          ) : (

            <tr>

              <td
                colSpan="3"
                style={{
                  textAlign: "center",
                  padding: "20px"
                }}
              >
                No scan logs found
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>
  );
}

export default ScanHistory;