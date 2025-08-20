import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Components/Dashboard.js";
import Analyse from "./Components/Analyse.js";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <Routes>
          {/* Main Dashboard Route */}
          <Route path="/" element={<Dashboard />} />

          {/* Analyse Route */}
          <Route path="/analyse" element={<Analyse />}></Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
