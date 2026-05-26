import React, {
  useCallback,
  useEffect,
  useState
} from "react";
import api from "../api/axios";
import "../styles/FeaturePages.css";

function ScanHistory() {

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);

  const [serialFilter, setSerialFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [resultFilter, setResultFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {

    try {

      const res = await api.get("scan-logs/");

      setLogs(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const applyFilters = useCallback(() => {

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

    if (statusFilter) {

      filtered = filtered.filter(
        (log) => log.serial_status === statusFilter
      );
    }

    if (resultFilter) {

      filtered = filtered.filter(
        (log) => log.scan_result === resultFilter
      );
    }

    if (fromDate) {

      const start = new Date(`${fromDate}T00:00:00`);

      filtered = filtered.filter(
        (log) => new Date(log.scanned_at) >= start
      );
    }

    if (toDate) {

      const end = new Date(`${toDate}T23:59:59`);

      filtered = filtered.filter(
        (log) => new Date(log.scanned_at) <= end
      );
    }

    setFilteredLogs(filtered);
  }, [
    logs,
    serialFilter,
    locationFilter,
    statusFilter,
    resultFilter,
    fromDate,
    toDate
  ]);

  const clearFilters = () => {
    setSerialFilter("");
    setLocationFilter("");
    setStatusFilter("");
    setResultFilter("");
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (

    <div className="feature-page">

      <div className="feature-header">
        <h1>Scan History</h1>
        <p>Review scan activity by serial, date, location, status and result.</p>
      </div>

      <div className="feature-panel wide">

        {/* FILTERS */}

        <div className="feature-row">

          <input
            className="feature-input"
            type="text"
            placeholder="Filter by serial"
            value={serialFilter}
            onChange={(e) =>
              setSerialFilter(e.target.value)
            }
          />

          <select
            className="feature-select"
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

        <div className="feature-row">

          <select
            className="feature-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >

            <option value="">
              All Serial Statuses
            </option>

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

          <select
            className="feature-select"
            value={resultFilter}
            onChange={(e) =>
              setResultFilter(e.target.value)
            }
          >

            <option value="">
              All Scan Results
            </option>

            <option value="VALID">
              VALID
            </option>

            <option value="INVALID">
              INVALID
            </option>

            <option value="SUSPECT">
              SUSPECT
            </option>

          </select>

        </div>

        <div className="feature-row filter-actions">

          <label className="date-field">
            <span>From date</span>
            <input
              className="feature-input"
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
            />
          </label>

          <label className="date-field">
            <span>To date</span>
            <input
              className="feature-input"
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
            />
          </label>

          <button
            className="secondary-action"
            onClick={clearFilters}
          >
            Clear Filters
          </button>

        </div>

        {/* TABLE */}

        <div className="table-wrap">

          <table className="data-table">

            <thead>

              <tr>

                <th>Serial</th>
                <th>Serial Status</th>
                <th>Scan Result</th>
                <th>Location</th>
                <th>Time</th>

              </tr>

            </thead>

            <tbody>

              {filteredLogs.length > 0 ? (

                filteredLogs.map((log, index) => (

                  <tr key={index}>

                    <td>{log.serial}</td>

                    <td>
                      {log.serial_status || "-"}
                    </td>

                    <td>
                      <span
                        className={
                          log.scan_result === "VALID"
                            ? "status-pill status-valid"
                            : log.scan_result === "SUSPECT"
                            ? "status-pill status-suspect"
                            : "status-pill status-invalid"
                        }
                      >
                        {log.scan_result}
                      </span>
                    </td>

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
                    className="empty-cell"
                    colSpan="5"
                  >
                    No scan logs found
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

export default ScanHistory;
