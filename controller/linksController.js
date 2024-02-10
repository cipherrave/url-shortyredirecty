import pool from "../database/connection.js";
import { nanoid } from "nanoid";

//Create a link
export async function createLink(req, res) {
  try {
    const { longurl } = req.body;
    const { shorturl } = nanoid(10); //doesnt work
    const newUrl = await pool.query(
      "INSERT INTO links (longurl, shorturl) VALUES($1, $2) RETURNING *",
      [longurl, shorturl]
    );

    res.json(newUrl.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

// Get all links
export async function getAllLinks(req, res) {
  try {
    const allLinks = await pool.query("SELECT * FROM links");
    res.json(allLinks.rows);
  } catch (err) {
    console.error(err.message);
  }
}

//Get one link
export async function getOneLink(req, res) {
  try {
    const { link_id } = req.params;
    const oneLink = await pool.query("SELECT * FROM links WHERE link_id = $1", [
      link_id,
    ]);
    res.json(oneLink.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
}

//Update a link
export async function updateOneLink(req, res) {
  try {
    const { link_id } = req.params;
    const { longurl } = req.body;

    const updatedLink = await pool.query(
      "UPDATE links SET longurl = $1 WHERE link_id= $2",
      [longurl, link_id]
    );

    res.json("Link has been updated");
  } catch (err) {
    console.error(err.message);
  }
}

//Delete a link
export async function deleteOneLink(req, res) {
  try {
    const { link_id } = req.params;
    const deleteOneLink = await pool.query(
      "DELETE FROM links WHERE link_id = $1",
      [link_id]
    );
    res.json("Link has been deleted");
  } catch (err) {
    console.error(err.message);
  }
}
