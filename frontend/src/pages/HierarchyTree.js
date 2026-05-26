import React, { useState } from "react";
import api from "../api/axios";
import "../styles/FeaturePages.css";

function TreeNode({ node }) {
  const children = node.children || [];

  return (
    <li>
      <span className="tree-serial">{node.serial}</span>
      {" "}
      <span className="tree-level">({node.level})</span>

      {children.length > 0 && (
        <ul>
          {children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function HierarchyTree() {

  const [serial, setSerial] = useState("");
  const [tree, setTree] = useState(null);
  const [error, setError] = useState("");

  const fetchTree = async () => {

    setError("");
    setTree(null);

    if (!serial.trim()) {
      setError("Please enter a serial");
      return;
    }

    try {
      const response = await api.get(`full-hierarchy/${serial}/`);
      setTree(response.data.tree || response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Serial not found");
    }
  };

  return (

    <div className="feature-page">

      <div className="feature-header">
        <h1>Hierarchy Tree</h1>
        <p>View the full parent-child structure for any serial.</p>
      </div>

      <div className="feature-panel">

        <div className="feature-form">

          <input
            className="feature-input"
            type="text"
            placeholder="Enter any serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />

          <button
            className="primary-action"
            onClick={fetchTree}
          >
            Show Tree
          </button>

        </div>

        {error && (
          <p className="alert error">
            {error}
          </p>
        )}

        {tree && (

          <div className="result-panel">

            <h3>Complete Hierarchy</h3>

            <div className="tree-scroll">
              <ul className="tree-list">
                <TreeNode node={tree} />
              </ul>
            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default HierarchyTree;
