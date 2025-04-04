import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined
});

// Connection check function
export async function checkConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log("✅ Successfully connected to PostgreSQL database");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to PostgreSQL database:", error);
    return false;
  } finally {
    if (client) client.release();
  }
}


checkConnection().then(isConnected => {
  if (!isConnected) {
    console.error("Database connection check failed on startup");
  }
});

export default pool;
