import { Router } from "express";
import * as reportController from "../controllers/reportController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", reportController.listReports);
router.post("/", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), reportController.generateReport);
router.get("/:id", reportController.getReport);
router.get("/:id/pdf", reportController.getReportPdf);

export default router;
