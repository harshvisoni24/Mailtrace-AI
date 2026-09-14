import { Router } from "express";
import * as campaignController from "../controllers/campaignController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", campaignController.listCampaigns);
router.post("/detect", authorize("ADMIN", "SECURITY_ANALYST"), campaignController.detectCampaigns);
router.get("/blast-radius", campaignController.getBlastRadius);
router.get("/threat-graph", campaignController.getThreatGraph);
router.get("/:id", campaignController.getCampaign);

export default router;
