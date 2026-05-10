import React, { useState } from "react";
import api from "../api/axios";

function TreeNode({ node }) {

  return (

    <li style={{ marginTop: "8px" }}>

      <span
        style={{
          fontWeight: "600"
        }}
      >
        {node.serial}
      </span>

      {" "}
      ({node.level})

      {node.children.length > 0 && (

        <ul
          style={{
            marginTop: "5px"
          }}
        >
          {node.children.map((child, index) => (
            <TreeNode
              key={index}
              node={child}
            />
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

    // Frontend validation
    if (!serial.trim()) {

      setError("Please enter a serial");
      return;
    }

    try {

      const response = await api.get(
        `full-hierarchy/${serial}/`
      );

      setTree(response.data);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        "Serial not found"
      );
    }
  };

  return (

    <div className="card">

      <h2>Hierarchy Tree Viewer</h2>

      <input
        type="text"
        placeholder="Enter any serial"
        value={serial}
        onChange={(e) => setSerial(e.target.value)}
      />

      <button
        className="action"
        onClick={fetchTree}
      >
        Show Tree
      </button>

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

      {tree && (

        <div
          style={{
            marginTop: "20px"
          }}
        >

          <h3>
            Complete Hierarchy
          </h3>

          <ul>
            <TreeNode node={tree} />
          </ul>

        </div>

      )}

    </div>
  );
}

export default HierarchyTree;