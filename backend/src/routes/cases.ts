import { Router } from "express";
import * as caseController from "../controllers/caseController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", caseController.listCases);
router.post("/", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), caseController.createCase);
router.get("/:id", caseController.getCase);
router.patch("/:id", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), caseController.updateCase);
router.post("/:id/notes", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), caseController.addCaseNote);
router.get("/:id/timeline", caseController.getCaseTimeline);
router.post("/:id/link-email", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), caseController.linkEmailToCase);

export default router;
