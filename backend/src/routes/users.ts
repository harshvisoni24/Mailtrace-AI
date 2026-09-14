import { Router } from "express";
import * as userController from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate, authorize("ADMIN"));

router.get("/", userController.listUsers);
router.patch("/:id", userController.updateUser);

export default router;
