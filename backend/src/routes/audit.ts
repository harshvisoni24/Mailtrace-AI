import { Router } from "express";
import * as auditController from "../controllers/auditController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/", auditController.listAuditLogs);

export default router;
