import { Router } from "express";
import {
  getProjects,
  addProject,
  editProject,
  removeProject,
} from "../controllers/project.controller";

const router = Router();

router.get("/", getProjects);
router.post("/", addProject);
router.put("/:id", editProject);
router.delete("/:id", removeProject);

export default router;