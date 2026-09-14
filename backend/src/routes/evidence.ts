import { Router } from "express";
import * as evidenceController from "../controllers/evidenceController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", evidenceController.listEvidence);
router.post("/", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), evidenceController.createEvidence);
router.get("/verify-ledger", evidenceController.verifyLedgerIntegrity);
router.get("/:id", evidenceController.getEvidence);

export default router;
