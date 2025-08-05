import fs from "fs";
import pkg from "pg";
const { Client } = pkg;

// 1. Read JSON file
const routesData = JSON.parse(fs.readFileSync("routes.json", "utf-8"));

// 2. Connect to PostgreSQL
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "urban_logistics", // your DB
  password: "1234",
  port: 5432,
});

async function importRoutes() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL");

    for (const route of routesData) {
      const { id, origin, destination } = route;

      // Insert into table
      await client.query(
        `INSERT INTO routes (id, origin_id, destination_id) 
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO NOTHING`,
        [id, origin.id, destination.id]
      );
    }

    console.log("Routes imported successfully!");
  } catch (err) {
    console.error("Error importing routes:", err);
  } finally {
    await client.end();
  }
}

importRoutes();
