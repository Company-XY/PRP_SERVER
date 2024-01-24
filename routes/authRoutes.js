import express from "express";
import { login, signup, assignRole } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.patch("/assign/:adminId/:userId", assignRole);

export default router;
