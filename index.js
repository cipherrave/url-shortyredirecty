import express from "express";
import dbInit from "./database/dbInit.js";
import healthCheck from "./controller/healthCheck.js";
import {
  createLink,
  deleteOneLink,
  deleteOneLinkAdmin,
  getAllLinks,
  getAllLinksAdmin,
  getAllLinksOneUserAdmin,
  getOneLink,
  getOneLinkAdmin,
  redirectController,
} from "./controller/linksController.js";
import dotenv from "dotenv";
import {
  createAdmin,
  createUser,
  deleteUser,
  deleteUserAdmin,
  getAllUsers,
  getOneUser,
  loginAdmin,
  loginUser,
  updateUser,
  updateUserAdmin,
} from "./controller/userController.js";
import isAuth from "./utils/isAuth.js";

const app = express();
//import links

dotenv.config();
const port = process.env.PORT;

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//INITIALIZE DATABASE
dbInit();

// Public Routes
app.get("/health", healthCheck);

// Admin Routes
app.post("/register/admin", createAdmin);
app.post("/login/admin", loginAdmin);
app.get("/admin/users/", isAuth, getOneUser);
app.get("/admin/users/all", isAuth, getAllUsers);
app.put("/admin/updateUser", isAuth, updateUserAdmin);
app.delete("/admin/deleteUser", isAuth, deleteUserAdmin);

// User Routes
app.post("/register", createUser);
app.post("/login", loginUser);
app.put("/user/updateUser", isAuth, updateUser);
app.delete("/user/deleteUser", isAuth, deleteUser);

// Admin Links Routes
app.get("/admin/links", isAuth, getOneLinkAdmin);
app.get("/admin/links/all", isAuth, getAllLinksAdmin);
app.post("/admin/links/user/all", isAuth, getAllLinksOneUserAdmin);
app.delete("/admin/links/delete", isAuth, deleteOneLinkAdmin);

// User Links Routes
app.post("/links/create", isAuth, createLink);
app.get("/user/links", isAuth, getOneLink);
app.get("/user/links/all", isAuth, getAllLinks);
app.delete("/user/links/delete", isAuth, deleteOneLink);

// Redirect route
app.get("/:shorturl", redirectController);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
