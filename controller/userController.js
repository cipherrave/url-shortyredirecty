import pool from "../database/connection.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import fastcsv from "fast-csv";

// Create an ADMIN
export async function createAdmin(req, res) {
  try {
    // Generate unique user id and validation key using nanoid
    let generatedID = nanoid();
    const user_id = generatedID;

    // Generate validation key that will be sent via email worker
    let generatedValidationKey = nanoid();
    const validation_key = generatedValidationKey;

    // Establish what needs to be included in JSON for POST, and encrypt it
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      // Establishing genSalt and encrypt password
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const admin_id = nanoid();
      const validated = false;

      // Inserting encrypted new admin details
      const newUser = await pool.query(
        "INSERT INTO users (user_id, username, email, password, admin_id, validation_key, validated) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [
          user_id,
          username,
          email,
          encryptedPassword,
          admin_id,
          validation_key,
          validated,
        ]
      );

      // Generate a response
      const apiResponse = {
        message: "Admin created successfully. Check email for validation link",
      };
      res.status(200).json(newUser.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Create a USER
export async function createUser(req, res) {
  try {
    // Generate unique user id and validation key using nanoid
    let generatedID = nanoid();
    const user_id = generatedID;
    let generatedValidationKey = nanoid();
    const validation_key = generatedValidationKey;

    // Establish what needs to be included in JSON for POST, and encrypt it
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      // Establishing genSalt and encrypt password
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      const validated = false;

      // Inserting new user details
      const newUser = await pool.query(
        "INSERT INTO users (user_id, username, email, password, validation_key, validated) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
        [user_id, username, email, encryptedPassword, validation_key, validated]
      );

      // Send validation key to email worker

      // Generate a response
      const apiResponse = {
        message: "User created successfully. Check email for validation link.",
      };
      res.status(200).json(newUser.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Email validation - USER & ADMIN
export async function validateAccount(req, res) {
  try {
    // Check validation key from url given in email
    let { validation_key } = req.params;
    const isValidationKeyValid = await pool.query(
      "SELECT * FROM users WHERE validation_key = $1",
      [validation_key]
    );
    if (isValidationKeyValid.rowCount === 0) {
      return res
        .status(404)
        .json("Validation key invalid. Please make sure correct link is used");
    } else {
      const user_id = isValidationKeyValid.rows[0].user_id;
      const validValidationKey = await pool.query(
        "UPDATE users SET validated = true WHERE user_id = $1",
        [user_id]
      );

      const apiResponse = {
        message: "Validation successful",
        username: isValidationKeyValid.rows[0].email,
        email: isValidationKeyValid.rows[0].email,
      };

      res.status(200).json(apiResponse);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Log into account - ADMIN
export async function loginAdmin(req, res) {
  try {
    // Making sure admin fill all fields
    const { email, password, admin_id } = req.body;
    if (!email || !password || !admin_id) {
      return res.status(400).json("Missing required fields");
    } else {
      // Check Admin email availability
      const checkAdminEmail = await pool.query(
        "SELECT * FROM users WHERE  email = $1",
        [email]
      );
      if (checkAdminEmail.rowCount === 0) {
        return res.status(404).json("Admin email not found");
      } else {
        // Check Admin id availability
        const checkAdminId = await pool.query(
          "SELECT * FROM users WHERE admin_id = $1",
          [admin_id]
        );
        if (checkAdminId.rowCount === 0) {
          return res.status(404).json("Admin id not found");
        } else {
          // Compare using hashed password
          const isPasswordCorrect = await bcrypt.compare(
            password,
            checkAdminId.rows[0].password
          );
          if (!isPasswordCorrect) {
            return res.status(401).json("Password incorrect");
          } else {
            // Check validation status
            const validated = true;
            const checkValidationStatus = await pool.query(
              "SELECT validated FROM users WHERE (email, validated) = ($1, $2)",
              [email, validated]
            );
            if (checkValidationStatus.rowCount === 0) {
              return res
                .status(404)
                .json(
                  "Email has not been validated. Please check your email inbox for validation link. Might wanna check your spam folder too."
                );
            } else {
              // If password matches, create a token using jsonwebtoken
              // Generate JWT token using userData with SECRET and EXPIRATION from .env file
              const userData = {
                admin_id: checkAdminId.rows[0].admin_id,
                username: checkAdminId.rows[0].username,
                email: checkAdminId.rows[0].email,
                validated: checkAdminId.rows[0].validated,
              };
              const token = jwt.sign(userData, process.env.JWT_SECRET);

              // Generate a response
              const apiResponse = {
                message: "Login successful",
                user: {
                  user_id: checkAdminId.rows[0].user_id,
                  username: checkAdminId.rows[0].username,
                  email: checkAdminId.rows[0].email,
                  admin_id: checkAdminId.rows[0].admin_id,
                  validated: checkAdminId.rows[0].validated,
                },
                token: token,
              };

              res.status(200).json(apiResponse);
            }
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Log into account - USER
export async function loginUser(req, res) {
  try {
    // Making sure user fill all fields
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      // Check user email availability
      const checkEmail = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (checkEmail.rowCount === 0) {
        return res.status(404).json("Email not found");
      } else {
        // Compare using hashed password
        const isPasswordCorrect = await bcrypt.compare(
          password,
          checkEmail.rows[0].password
        );
        if (!isPasswordCorrect) {
          return res.status(401).json("Password incorrect");
        } else {
          // Check validation status
          const validated = true;
          const checkValidationStatus = await pool.query(
            "SELECT validated FROM users WHERE (email, validated) = ($1, $2)",
            [email, validated]
          );
          if (checkValidationStatus.rowCount === 0) {
            return res
              .status(404)
              .json(
                "Email has not been validated. Please check your email inbox for validation link. Might wanna check your spam folder too."
              );
          } else {
            // If password matches, create a token using jsonwebtoken
            // Generate JWT token using userData with SECRET and EXPIRATION from .env file
            const userData = {
              user_id: checkEmail.rows[0].user_id,
              username: checkEmail.rows[0].username,
              email: checkEmail.rows[0].email,
              validated: checkEmail.rows[0].validated,
            };
            const token = jwt.sign(userData, process.env.JWT_SECRET);

            // Generate response
            const apiResponse = {
              message: "Login successful",
              user: {
                user_id: checkEmail.rows[0].user_id,
                username: checkEmail.rows[0].username,
                email: checkEmail.rows[0].email,
                validated: checkEmail.rows[0].validated,
              },
              token: token,
            };

            res.status(200).json(apiResponse);
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get one user - ADMIN
export async function getOneUser(req, res) {
  try {
    // Read data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("user_data_admin.csv");

    // Check admin id availability in token
    const checkAdminId = await pool.query(
      "SELECT * FROM users WHERE admin_id = $1",
      [admin_id]
    );
    if (checkAdminId.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not Authorized!");
    } else {
      // Enter email of user/admin to get info from
      const { email } = req.body;
      const oneUser = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (oneUser.rowCount === 0) {
        return res.status(401).json("User account not found");
      } else {
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneUser.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneUser.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("user_data_admin.csv generated");
          return res.json(oneUser.rows);
        } else {
          return res.json(
            "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all users - ADMIN
export async function getAllUsers(req, res) {
  try {
    // Read data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_users_admin.csv");

    // Check admin id availability in token
    const checkAdminId = await pool.query(
      "SELECT * FROM users WHERE admin_id = $1",
      [admin_id]
    );
    if (checkAdminId.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not Authorized!");
    } else {
      // Query to list all users in database
      const allUsers = await pool.query("SELECT * FROM users");

      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allUsers.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allUsers.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_users_admin.csv generated");
        return res.json(allUsers.rows);
      } else {
        return res.json(
          "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
        );
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update user/admin account - ADMIN
export async function updateUserAdmin(req, res) {
  try {
    // Read data from token
    const authData = req.user;
    const admin_id = authData.admin_id;

    // Check admin id availability in token
    const checkAdminId = await pool.query(
      "SELECT * FROM users WHERE admin_id = $1",
      [admin_id]
    );
    if (checkAdminId.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not Authorized!");
    } else {
      const { user_id, username, email, password } = req.body;
      // check user_id availability
      const checkUserID = await pool.query(
        "SELECT * FROM users WHERE user_id = $1",
        [user_id]
      );
      if (checkUserID.rowCount === 0) {
        return res.status(404).json("User ID not found.");
      } else {
        // Generate password hash
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);

        // Update credentials based on user_id
        const updateUserAdmin = await pool.query(
          "UPDATE users SET (username, email, password) = ($1, $2, $3) WHERE user_id= $4 RETURNING *",
          [username, email, encryptedPassword, user_id]
        );

        // Read back new data from user_id
        const updateUserAdminRead = await pool.query(
          "SELECT * FROM users WHERE user_id = $1",
          [user_id]
        );

        const newUserData = {
          message: "User data has been updated",
          user_id: updateUserAdminRead.rows[0].user_id,
          username: updateUserAdminRead.rows[0].username,
          email: updateUserAdminRead.rows[0].email,
          password: password,
          admin_id: updateUserAdminRead.rows[0].admin_id,
        };

        res.status(200).json(newUserData);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update a user - USER
export async function updateUser(req, res) {
  try {
    // Read data from token
    const authData = req.user;
    const user_id = authData.user_id;

    // Check user id availability in token
    const checkUserId = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    if (checkUserId.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      const { username, email, password } = req.body;
      // Generate password hash
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);

      // Update user with user_id specified in token
      const updateUser = await pool.query(
        "UPDATE users SET (username, email, password) = ($1, $2, $3) WHERE user_id= $4",
        [username, email, encryptedPassword, user_id]
      );

      // Read back new data from user_id
      const updateUserRead = await pool.query(
        "SELECT * FROM users WHERE user_id = $1",
        [user_id]
      );

      const newUserData = {
        message: "User data has been updated",
        user_id: updateUserRead.rows[0].user_id,
        username: updateUserRead.rows[0].username,
        email: updateUserRead.rows[0].email,
        password: password,
      };

      res.status(200).json(newUserData);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete own or other account - ADMIN.
export async function deleteUserAdmin(req, res) {
  try {
    // Read data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminId = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminId.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not Authorized!");
    } else {
      // Try to implement feature for not deleting other admin acoount or delete yourself

      const { email } = req.body;
      // Delete data from specified email
      const deleteUser = await pool.query(
        "DELETE FROM users WHERE email = $1",
        [email]
      );
      if (deleteUser.rowCount === 0) {
        return res.status(404).json("Email not found");
      } else {
        res.json("User has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete own account - USER
export async function deleteUser(req, res) {
  try {
    // Read user_id from token
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      const { password } = req.body;

      // Compare using hashed password for verification
      const isPasswordCorrect = await bcrypt.compare(
        password,
        checkUserID.rows[0].password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json("Password incorrect");
      } else {
        // Delete user from user_id token
        const deleteUser = await pool.query(
          "DELETE FROM users WHERE user_id = $1",
          [user_id]
        );

        res.json("User has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
