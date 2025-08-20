import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Analyse() {
  const [salesData, setSalesData] = useState({ labels: [], datasets: [] });
  const [customerData, setCustomerData] = useState({ labels: [], datasets: [] });
  const [categoryData, setCategoryData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const res = await axios.get("http://localhost:5000/csv");
        Papa.parse(res.data, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            const rows = results.data;

            // --- Sales by Region ---
            const regions = [...new Set(rows.map(r => r.Region))];
            const salesByRegion = regions.map(
              region => rows
                .filter(r => r.Region === region)
                .reduce((sum, r) => sum + parseFloat(r.Sales), 0)
            );
            setSalesData({
              labels: regions,
              datasets: [
                {
                  label: "Sales by Region",
                  data: salesByRegion,
                  backgroundColor: "rgba(75,192,192,0.6)"
                }
              ]
            });

            // --- Top 10 Customers by % Sales ---
            const customerMap = {};
            rows.forEach(r => {
              customerMap[r["Customer Name"]] =
                (customerMap[r["Customer Name"]] || 0) + parseFloat(r.Sales);
            });

            const totalSales = Object.values(customerMap).reduce((a, b) => a + b, 0);
            const topCustomers = Object.entries(customerMap)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10);

            setCustomerData({
              labels: topCustomers.map(c => c[0]),
              datasets: [
                {
                  label: "Top 10 Customers (% Sales)",
                  data: topCustomers.map(c => ((c[1] / totalSales) * 100).toFixed(2)),
                  backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF",
                    "#FF9F40", "#C9CBCF", "#F7464A", "#46BFBD", "#FDB45C"
                  ]
                }
              ]
            });

            // --- Top 10 Categories ---
            const categoriesMap = {};
            rows.forEach(r => {
              categoriesMap[r.Category] =
                (categoriesMap[r.Category] || 0) + parseFloat(r.Sales);
            });
            const topCategories = Object.entries(categoriesMap)
              .sort((a,b) => b[1]-a[1])
              .slice(0,10);

            setCategoryData({
              labels: topCategories.map(c => c[0]),
              datasets: [
                {
                  label: "Top Categories by Sales",
                  data: topCategories.map(c => c[1]),
                  backgroundColor: [
                    "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF",
                    "#FF9F40","#C9CBCF","#F7464A","#46BFBD","#FDB45C"
                  ]
                }
              ]
            });

            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error fetching CSV:", err);
        setLoading(false);
      }
    };

    fetchCSV();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}><h2>Loading charts...</h2></div>;
  }
const chartBoxStyle = {
  backgroundColor: "#fff",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  borderRadius: "10px",
  padding: "20px",
  width: "320px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
      position: "right", // <--- Move legend to the right
      align: "center",
      labels: {
        boxWidth: 20,
        font: { size: 14 }
      }
    }
  }
};

return (
  
  <div
    style={{
      padding: "30px",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
      boxSizing: "border-box",
    }}
  >
    <h1 style={{ fontWeight: "bold", marginBottom: "30px" }}>
      Dashboard & Analytics
    </h1>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        marginBottom: "30px",
        flexWrap: "wrap",
      }}
    >
      {/* First row: Sales by Region and Percentage Categories by Sales */}
      {salesData.datasets.length > 0 && (
        <div style={chartBoxStyle}>
          <h2>Sales by Region</h2>
          <div style={{ width: "100%", height: "250px" }}>
            <Bar data={salesData} options={{ responsive: true }} />
          </div>
        </div>
      )}

      {categoryData.datasets.length > 0 && (
        <div style={chartBoxStyle}>
          <h2>Percentage Categories by Sales</h2>
          <div style={{ width: "100%", height: "250px" }}>
            <Pie data={categoryData} options={{ responsive: true }} />
          </div>
        </div>
      )}
    </div>
    {/* Second row: Top 10 Customers */}
    <div style={{ display: "flex", justifyContent: "center" }}>
  {customerData.datasets.length > 0 && (
    <div style={chartBoxStyle}>
      <h2>Top 10 Customers (% Sales)</h2>
      <div style={{ width: "350px", height: "260px", display: "flex", alignItems: "center" }}>
        <Doughnut data={customerData} options={doughnutOptions} />
      </div>
    </div>
  )}
</div>
  </div>
);

// chartBoxStyle can be defined at the top of your component:

}
