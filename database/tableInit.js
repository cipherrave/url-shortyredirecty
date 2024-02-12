import pool from "./connection.js";

// create User table if not exist
export async function createUsersTable() {
  try {
    const createTableQuery = await pool.query(
      'CREATE TABLE IF NOT EXISTS "users" ( user_id VARCHAR(225) UNIQUE PRIMARY KEY, username VARCHAR(225) NOT NULL UNIQUE, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(225) NOT NULL, admin_id VARCHAR(225), validation_key VARCHAR(255) NOT NULL UNIQUE, validated BOOLEAN NOT NULL, premiumuser_id VARCHAR(255) UNIQUE, creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP )'
    );
    console.log("users table created successfully");
  } catch (error) {
    console.log(error, "Error creating users table");
  }
}

// create Links table if not exist
export async function createLinksTable() {
  try {
    const createTableQuery = await pool.query(
      'CREATE TABLE IF NOT EXISTS "links" ( link_id VARCHAR(225) UNIQUE PRIMARY KEY, longurl VARCHAR(225), shorturl VARCHAR(225), visit_count NUMERIC, activated BOOLEAN NOT NULL, user_id VARCHAR(225) REFERENCES "users"(user_id), creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP )'
    );
    console.log("links table created successfully");
  } catch (error) {
    console.log(error, "Error creating links table");
  }
}

export async function createRedirectTable() {
  try {
    const createTableQuery = await pool.query(
      'CREATE TABLE IF NOT EXISTS "redirect_analytics" ( id SERIAL, link_id VARCHAR(225) REFERENCES "links"(link_id), longurl VARCHAR(225), visit_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, browser_used VARCHAR(255), location VARCHAR(255) )'
    );
    console.log("redirect_analytics table created successfully");
  } catch (error) {
    console.log(error, "Error creating redirect_analytics table");
  }
}
