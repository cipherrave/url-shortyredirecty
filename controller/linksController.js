import pool from "../database/connection.js";
import { nanoid } from "nanoid";

//Create a link
export async function createLink(req, res) {
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
    }

    // Generate link_id using nanoid
    let generatedID = nanoid();
    const link_id = generatedID;

    const { longurl } = req.body;

    // Generate shorurl using nanoid
    let generatedShort = nanoid(10);
    const shorturl = generatedShort;

    // Insert details into links table
    const newUrl = await pool.query(
      "INSERT INTO links (link_id, longurl, shorturl, user_id) VALUES($1, $2, $3, $4) RETURNING *",
      [link_id, longurl, shorturl, user_id]
    );

    // Generate response
    const apiResponse = {
      message: "A short url is generated",
      data: {
        link_id: generatedID,
        longurl: longurl,
        shorturl: "short.ly/" + shorturl,
        user_id: user_id,
      },
    };

    res.json(apiResponse);
  } catch (err) {
    console.error(err.message);
  }
}

// Get all links - ADMIN
export async function getAllLinksAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    }

    // List all links in links table regardless of user
    const allLinks = await pool.query("SELECT * FROM links", []);
    res.json(allLinks.rows);
  } catch (err) {
    console.error(err.message);
  }
}

// Get all links from one user - ADMIN
export async function getAllLinksOneUserAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    }

    // List all links in links table from one user
    const { user_id } = req.body;
    const allLinks = await pool.query(
      "SELECT * FROM links WHERE user_id = $1",
      [user_id]
    );
    if (allLinks.rowCount === 0) {
      return res.status(404).json("No links with specified user_id");
    }
    res.json(allLinks.rows);
  } catch (err) {
    console.error(err.message);
  }
}

// Get all links - USER
export async function getAllLinks(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    }

    // List all links in links table where the user_id is same as in token
    const allLinks = await pool.query(
      "SELECT * FROM links WHERE user_id = $1",
      [user_id]
    );
    if (allLinks.rowCount === 0) {
      return res.status(404).json("No links with specified user_id");
    }

    res.json(allLinks.rows);
  } catch (err) {
    console.error(err.message);
  }
}

//Get one link - ADMIN
export async function getOneLinkAdmin(req, res) {
  try {
    // Read admin_id from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    }

    // Get data from shorturl
    const { shorturl } = req.body;
    const oneLink = await pool.query(
      "SELECT * FROM links WHERE shorturl = $1",
      [shorturl]
    );
    if (oneLink.rowCount === 0) {
      return res.status(404).json("No link with specified user_id");
    }

    res.json(oneLink.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

//Get one link - USER
export async function getOneLink(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    }

    // Get data from shorturl
    const { shorturl } = req.body;
    const oneLink = await pool.query(
      "SELECT * FROM links WHERE (user_id, shorturl)  = ($1, $2)",
      [user_id, shorturl]
    );
    if (oneLink.rowCount === 0) {
      return res.status(404).json("No link with specified short url");
    }

    res.json(oneLink.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

// Delete a link - ADMIN
export async function deleteOneLinkAdmin(req, res) {
  try {
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    }

    const { link_id } = req.body;
    const deleteOneLink = await pool.query(
      "DELETE FROM links WHERE link_id = $1",
      [link_id]
    );
    if (deleteOneLink.rowCount === 0) {
      return res.status(404).json("Link not found.");
    }

    res.json("Link has been deleted");
  } catch (err) {
    console.error(err.message);
  }
}

// Delete a link - USER
export async function deleteOneLink(req, res) {
  try {
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    }

    const { link_id } = req.body;
    const deleteOneLink = await pool.query(
      "DELETE FROM links WHERE link_id = $1",
      [link_id]
    );
    if (deleteOneLink.rowCount === 0) {
      return res.status(404).json("Link not found.");
    }

    res.json("Link has been deleted");
  } catch (err) {
    console.error(err.message);
  }
}

//Redirecting
export async function redirectController(req, res) {
  try {
    const { shorturl } = req.params;
    const longUrlObtain = await pool.query(
      "SELECT longUrl FROM links WHERE shorturl = $1",
      [shorturl]
    );

    const longUrl = longUrlObtain.rows[0].longurl;
    console.log(longUrl); // output will be just the real url. no headers

    res.redirect(longUrl);
  } catch (error) {
    res.status(500).json(error);
  }
}
