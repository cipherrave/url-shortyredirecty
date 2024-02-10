import express from "express";
import dbInit from "./database/dbInit.js";
import healthCheck from "./controller/healthCheck.js";
import {
  createLink,
  deleteOneLink,
  getAllLinks,
  getOneLink,
  redirectController,
} from "./controller/linksController.js";
import dotenv from "dotenv";
import {
  createUser,
  deleteOneUser,
  getAllUsers,
  getOneUser,
  loginUser,
  updateOneUser,
} from "./controller/userController.js";

const app = express();
//import links

dotenv.config();
const port = process.env.PORT;

//MIDDLEWARE
app.use(express.json());

//INITIALIZE DATABASE
dbInit();

// User Routes
app.get("/health", healthCheck);
app.post("/register", createUser);
app.post("/login", loginUser);

// Admin Routes
app.get("/admin/users/all", getAllUsers);
app.get("/admin/users/", getOneUser);
app.put("/users", updateOneUser);
app.delete("/admin/deleteUser", deleteOneUser);

// Links Routes
app.post("/links", createLink);
app.get("/links/all", getAllLinks);
app.get("/links/:link_id", getOneLink);
// app.put("/links/:link_id", updateOneLink); <- route disabled lol
app.delete("/links/:link_id", deleteOneLink);
app.post("/redirect/:shorturl", redirectController);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
