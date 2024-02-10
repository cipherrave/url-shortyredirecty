import pool from "../database/connection.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { encrypt, decrypt } from "../utils/encryption.js";
import bcrypt from "bcrypt";
import { response } from "express";

// Create a user
export async function createUser(req, res) {
  try {
    // Generate unique user id using nanoid
    let generatedID = nanoid();
    const user_id = generatedID;

    // Establish what needs to be included in JSON for POST, and encrypt it
    const { username, email, password } = req.body;
    const encryptedUsername = encrypt(username);
    const encryptedEmail = encrypt(email);

    // Establishing genSalt and encrypt password
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    // Inserting encrypted new user details
    const newUser = await pool.query(
      "INSERT INTO users (user_id, username, email, password) VALUES($1, $2, $3, $4) RETURNING *",
      [user_id, encryptedUsername, encryptedEmail, encryptedPassword]
    );

    const apiResponse = {
      message: "User created successfully",
    };
    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Log into user
export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const encryptedEmail = encrypt(email);

    const checkLoginEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [encryptedEmail]
    );

    // Compare using hashed password
    const isPasswordCorrect = "pop";
    if (!isPasswordCorrect) {
      return res.status(401).json("Password incorrect");
    }

    // Decrypt username
    const decryptedUsername = decrypt(response.rows[0].username);
    const decryptedEmail = decrypt(response.rows[0].email);

    // If password matches, create a token using jsonwebtoken
    const userData = {
      user_id: response.rows[0].user_id,
      username: decryptedUsername,
      email: decryptedEmail,
    };
    const token = jwt.sign(userData, process.env.JWT_SECRET);

    // If password matches, return user object
    const apiResponse = {
      message: "Login successful",
      user: {
        user_id: response.rows[0].user_id,
        username: decryptedUsername,
        email: decryptedEmail,
        token: token,
      },
    };

    res.status(200).json(apiResponse);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all user - needs decryption
export async function getAllUsers(req, res) {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (error) {
    console.error(error.message);
  }
}

// Get one user - needs decryption
export async function getOneUser(req, res) {
  try {
    const { user_id } = req.body;
    const oneUser = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);

    const decryptedUsername = decrypt(oneUser.rows[0].username);
    console.log(decryptedUsername);

    /* const decryptedEmail = decrypt(oneUser.rows[0].email);

    const userData = {
      username: decryptedUsername,
      email: decryptedEmail,
    };

    res.json(oneUser.rows[0]);*/
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update a user
export async function updateOneUser(req, res) {
  try {
    const { user_id, username, email, password } = req.body;
    const updateUser = await pool.query(
      "UPDATE users SET (username, email, password) = ($1, $2, $3) WHERE user_id= $4",
      [username, email, password, user_id]
    );

    res.json("User has been updated");
  } catch (err) {
    console.error(err.message);
  }
}

//Delete a user - DONE
export async function deleteOneUser(req, res) {
  try {
    const { user_id } = req.body;
    const deleteOneUser = await pool.query(
      "DELETE FROM users WHERE user_id = $1",
      [user_id]
    );
    res.json("User has been deleted");
  } catch (err) {
    console.error(err.message);
  }
}
