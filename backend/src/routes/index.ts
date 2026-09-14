import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./users";
import emailRoutes from "./emails";
import caseRoutes from "./cases";
import evidenceRoutes from "./evidence";
import reportRoutes from "./reports";
import alertRoutes from "./alerts";
import auditRoutes from "./audit";
import dashboardRoutes from "./dashboard";
import campaignRoutes from "./campaigns";
import intelRoutes from "./intel";
import copilotRoutes from "./copilot";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/emails", emailRoutes);
router.use("/cases", caseRoutes);
router.use("/evidence", evidenceRoutes);
router.use("/reports", reportRoutes);
router.use("/alerts", alertRoutes);
router.use("/audit", auditRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/threat-intelligence", intelRoutes);
router.use("/copilot", copilotRoutes);

export default router;
