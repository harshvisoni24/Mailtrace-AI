import { Router } from "express";
import * as copilotController from "../controllers/copilotController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);
router.post("/ask", copilotController.ask);

export default router;
