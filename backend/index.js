// backend/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import AWS from "aws-sdk";
import { 
  AthenaClient, 
  StartQueryExecutionCommand, 
  GetQueryResultsCommand,
  GetQueryExecutionCommand
} from "@aws-sdk/client-athena";

const app = express();

// ✅ Enable CORS for frontend
app.use(cors({ origin: "https://frontend-8kgj.onrender.com" }));

// ✅ JSON parsing
app.use(bodyParser.json());

// ✅ Configure AWS S3
const s3 = new AWS.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// ✅ Athena client
const client = new AthenaClient({ region: "ap-south-1" });
async function waitForQuery(client, executionId) {
  while (true) {
    const status = await client.send(
      new GetQueryExecutionCommand({ QueryExecutionId: executionId })
    );

    const state = status.QueryExecution.Status.State;

    if (state === "SUCCEEDED") {
      return;
    }
    if (state === "FAILED" || state === "CANCELLED") {
      throw new Error(
        `Query ${state}: ${status.QueryExecution.Status.StateChangeReason}`
      );
    }

    // wait 1s then check again
    await new Promise((r) => setTimeout(r, 1000));
  }
}

// ✅ Health check
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

app.get("/csv", async (req, res) => {
  try {
    const params = {
      Bucket: "superstore.bucket",  // must match exactly
      Key: "Superstore.csv"         // case-sensitive
    };

    const data = await s3.getObject(params).promise();

    res.setHeader("Content-Type", "text/csv");
    res.send(data.Body.toString("utf-8"));
  } catch (err) {
    console.error("❌ S3 CSV Fetch Error:", err);  // <---- important
    res.status(500).json({ error: err.message, code: err.code });
  }
});


// ✅ Run Athena query
app.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    console.log("▶️ Running Athena Query:", query);

    // Start query execution
    const start = await client.send(
      new StartQueryExecutionCommand({
        QueryString: query,
        QueryExecutionContext: { Database: "quickstoredb" }, // ⚠️ ensure DB exists
        ResultConfiguration: {
          OutputLocation: "s3://superstore-bucket3/query-results/", // ⚠️ ensure bucket exists + IAM access
        },
      })
    );

    const executionId = start.QueryExecutionId;
    console.log("✅ Athena Execution ID:", executionId);

    // Poll until query finishes
    await waitForQuery(client, executionId);

    // Fetch results
    const result = await client.send(
      new GetQueryResultsCommand({ QueryExecutionId: executionId })
    );

    console.log("✅ Query succeeded, returning results");
    res.json(result.ResultSet.Rows);
  } catch (err) {
    console.error("❌ Athena Query Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Backend server running on http://localhost:5000");
});
