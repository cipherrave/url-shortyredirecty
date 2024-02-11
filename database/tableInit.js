import pool from "./connection.js";

// create User table if not exist
export async function createUsersTable() {
  try {
    const queryInit =
      'CREATE TABLE IF NOT EXISTS "users" ( user_id VARCHAR(225) UNIQUE PRIMARY KEY, username VARCHAR(225) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(225) NOT NULL, creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, admin_id VARCHAR(225) );';
    await pool.query(queryInit);
    console.log("Users table created successfully");
  } catch (error) {
    console.log(error, "Error creating Users table");
  }
}

// create Links table if not exist
export async function createLinksTable() {
  try {
    const queryInit =
      'CREATE TABLE IF NOT EXISTS "links" ( link_id VARCHAR(225) UNIQUE PRIMARY KEY, longurl VARCHAR(225), shorturl VARCHAR(225), creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, visit_count NUMERIC, user_id VARCHAR(225) REFERENCES "users"(user_id) );';
    await pool.query(queryInit);

    console.log("Links table created successfully");
  } catch (error) {
    console.log(error, "Error creating Links table");
  }
}
