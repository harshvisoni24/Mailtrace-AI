import { Router } from "express";
import * as alertController from "../controllers/alertController";
import { authenticate } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", alertController.listAlerts);
router.patch("/:id/read", alertController.markAlertRead);

export default router;
