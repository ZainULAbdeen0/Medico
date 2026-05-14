import { Router } from "express";
import { authorize, verifyToken } from "../middleware/auth";
import { getAuditLogs } from "../controllers/auditController";

const router = Router();

router.get("/", verifyToken, authorize(["admin"]), getAuditLogs);

export default router;
