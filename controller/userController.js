import pool from "../database/connection.js";
import { nanoid } from "nanoid";

// Create a user
export async function createUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const newUser = await pool.query(
      "INSERT INTO users (username, email, password) VALUES($1, $2, $3) RETURNING *",
      [username, email, password]
    );

    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

// Log into user

// Get all user
export async function getAllUsers(req, res) {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
  }
}

// Get one user
export async function getOneUser(req, res) {
  try {
    const { user_id } = req.params;
    const oneUser = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    res.json(oneUser.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

// Update a user
export async function updateOneUser(req, res) {
  try {
    const { user_id } = req.params;
    const { username, email, password } = req.body;

    const updateUser = await pool.query(
      "UPDATE users SET (username, email, password) = ($1, $2, $3) WHERE user_id= $4",
      [username, email, password, user_id]
    );

    res.json("User has been updated");
  } catch (err) {
    console.error(err.message);
  }
}

//Delete a user
export async function deleteOneUser(req, res) {
  try {
    const { user_id } = req.params;
    const deleteOneUser = await pool.query(
      "DELETE FROM users WHERE user_id = $1",
      [user_id]
    );
    res.json("User has been deleted");
  } catch (err) {
    console.error(err.message);
  }
}
