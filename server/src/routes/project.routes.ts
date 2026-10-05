import { Router } from "express";
import {
  getProjects,
  addProject,
  editProject,
  removeProject,
} from "../controllers/project.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateToken);

router.get("/", getProjects);
router.post("/", addProject);
router.put("/:id", editProject);
router.delete("/:id", removeProject);

export default router;