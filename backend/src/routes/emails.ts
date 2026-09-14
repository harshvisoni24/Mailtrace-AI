import { Router } from "express";
import * as emailController from "../controllers/emailController";
import { authenticate, authorize } from "../middleware/auth";
import { uploadEmailFile } from "../middleware/upload";

const router = Router();
router.use(authenticate);

router.get("/", emailController.listEmails);
router.post("/upload", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), uploadEmailFile.single("emailFile"), emailController.uploadEmail);
router.post("/paste", authorize("ADMIN", "SECURITY_ANALYST", "INVESTIGATOR"), emailController.pasteEmail);
router.get("/:id", emailController.getEmail);
router.get("/:id/headers", emailController.getEmailHeaders);
router.get("/:id/iocs", emailController.getEmailIocs);
router.get("/:id/trace", emailController.getEmailTrace);

export default router;
