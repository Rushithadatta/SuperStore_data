// backend/routes/analyse.js
const express = require("express");
const AWS = require("aws-sdk");
const csv = require("csv-parser");

const router = express.Router();

// Configure S3
const s3 = new AWS.S3({
  region: "ap-south-1", // change to your AWS region
});

// Fetch and parse CSV
router.get("/analyse", async (req, res) => {
  const params = {
    Bucket: "superstore.bucket",
    Key: "Superstore.csv",
  };

  const results = [];

  try {
    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream
      .pipe(csv())
      .on("data", (row) => {
        results.push(row);
      })
      .on("end", () => {
        res.json(results);
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching CSV" });
  }
});

module.exports = router;
