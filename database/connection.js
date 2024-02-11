import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: 5432,
  database: process.env.PGDATABASE,
  //ssl: process.env.SSL,
});

export default pool;
