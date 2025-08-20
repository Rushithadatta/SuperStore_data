import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState([]);
  const navigate = useNavigate(); // for navigation

  const runQuery = async () => {
    try {
      const response = await fetch("http://localhost:5000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error running query:", error);
    }
  };

  const handleAnalyseClick = () => {
    navigate("/analyse"); // Navigate to Analyse page
  };

  return (
  <div
    style={{
      maxWidth: "900px",
      margin: "40px auto",
      backgroundColor: "#ffffff",
      padding: "30px 40px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      borderRadius: "12px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333",
    }}
  >
    <h2 style={{ marginBottom: "25px", fontWeight: "700", fontSize: "28px" }}>
      Dashboard
    </h2>

    <textarea
      rows={4}
      cols={70}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Enter SQL query here..."
      style={{
        width: "100%",
        padding: "12px 16px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1.5px solid #ccc",
        resize: "vertical",
        boxSizing: "border-box",
        fontFamily: "monospace",
        transition: "border-color 0.3s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
      onBlur={(e) => (e.target.style.borderColor = "#ccc")}
    />
    <button
      onClick={runQuery}
      style={{
        marginTop: "15px",
        backgroundColor: "#4CAF50",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        padding: "12px 26px",
        fontSize: "16px",
        cursor: "pointer",
        boxShadow: "0 4px 8px rgba(76, 175, 80, 0.4)",
        transition: "background-color 0.3s",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#45a049")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#4CAF50")}
    >
      Run Query
    </button>

    <div
      style={{
        marginTop: "30px",
        maxHeight: "400px",
        overflowY: "auto",
        borderRadius: "8px",
        boxShadow: "inset 0 0 10px #eee",
      }}
    >
      {data.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "15px",
            textAlign: "left",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f0f4f8",
              borderBottom: "2px solid #ddd",
              position: "sticky",
              top: 0,
              zIndex: 1,
            }}
          >
            <tr>
              {data[0].Data.map((col, idx) => (
                <th
                  key={idx}
                  style={{ padding: "12px 15px", fontWeight: "600", color: "#555" }}
                >
                  {col.VarCharValue || "Column"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: "1px solid #e1e1e1",
                  backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff",
                }}
              >
                {row.Data.map((cell, j) => (
                  <td key={j} style={{ padding: "10px 15px" }}>
                    {cell.VarCharValue || ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>

    <button
      onClick={handleAnalyseClick}
      style={{
        marginTop: "35px",
        backgroundColor: "#007bff",
        color: "white",
        padding: "14px 32px",
        border: "none",
        borderRadius: "8px",
        fontSize: "17px",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 5px 15px rgba(0, 123, 255, 0.4)",
        transition: "background-color 0.3s",
        display: "block",
        width: "100%",
      }}
      onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
      onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
    >
      Analyse Using Charts
    </button>
  </div>
);
}
