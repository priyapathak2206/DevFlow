
import { Router } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import {
  listTasks,
  addTask,
  editTask,
  removeTask,
} from "../controllers/task.controller";

const router = Router();

router.use(authenticateToken);

router.get("/", listTasks);
router.post("/", addTask);
router.put("/:id", editTask);
router.delete("/:id", removeTask);

export default router;