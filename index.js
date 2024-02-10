import express from "express";
import dbInit from "./database/dbInit.js";
import healthCheck from "./controller/healthCheck.js";
import {
  createLink,
  deleteOneLink,
  getAllLinks,
  getOneLink,
  updateOneLink,
} from "./controller/linksController.js";
import dotenv from "dotenv";
import {
  createUser,
  deleteOneUser,
  getAllUsers,
  getOneUser,
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

//ROUTES
app.get("/health", healthCheck);
app.post("/register", createUser);
app.get("/admin/users/all", getAllUsers);
app.get("/admin/users/:user_id", getOneUser);
app.put("/users/:user_id", updateOneUser);
app.delete("/admin/deleteUser/:user_id", deleteOneUser);
app.post("/links", createLink);
app.get("/links/all", getAllLinks);
app.get("/links/:link_id", getOneLink);
app.put("/links/:link_id", updateOneLink);
app.delete("/links/:link_id", deleteOneLink);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
