import pool from "../database/connection.js";

//Redirecting and visit_counter
export async function redirectController(req, res) {
  try {
    const { shorturl } = req.params;

    // Check if shorturl is activated
    const isLinkActivated = await pool.query(
      "SELECT activated FROM links WHERE shorturl = $1",
      [shorturl]
    );
    if (isLinkActivated.rows[0] === "false") {
      return res.status(404).json("Link is not activated");
    } else {
      const linkDataObtain = await pool.query(
        "SELECT * FROM links WHERE shorturl = $1",
        [shorturl]
      );
      if (linkDataObtain.rowCount === 0) {
        return res.status(404).json("Link not found");
      } else {
        const updateCounter = await pool.query(
          "UPDATE links SET visit_count = visit_count + 1 WHERE shorturl = $1",
          [shorturl]
        );

        const link_id = linkDataObtain.rows[0].link_id;
        const longurl = linkDataObtain.rows[0].longurl;
        console.log(longurl);
        const browser_used = "lol";
        const location = "lol";
        const insertRedirectAnalytics = await pool.query(
          "INSERT INTO redirect_analytics (link_id, longurl, browser_used, location) VALUES ($1, $2, $3, $4) RETURNING *",
          [link_id, longurl, browser_used, location]
        );
        res.redirect("https://" + longurl);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
