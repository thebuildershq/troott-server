import express from "express";
import { register } from "../../../controllers/auth.controller";

const router = express.Router({mergeParams: true})
router.post('/register', register)

export default router