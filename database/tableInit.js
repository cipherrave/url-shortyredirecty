import pool from "./connection.js";

// create User table if not exist
export async function createUsersTable() {
  try {
    const queryInit =
      'CREATE TABLE IF NOT EXISTS "users" ( user_id TEXT UNIQUE PRIMARY KEY, username VARCHAR(255) NOT NULL UNIQUE, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP );';
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
      'CREATE TABLE IF NOT EXISTS "links" ( link_id SERIAL PRIMARY KEY, longurl VARCHAR(255), shorturl VARCHAR(255), creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, user_id TEXT REFERENCES "users"(user_id) );';
    await pool.query(queryInit);
    console.log("Links table created successfully");
  } catch (error) {
    console.log(error, "Error creating Links table");
  }
}
