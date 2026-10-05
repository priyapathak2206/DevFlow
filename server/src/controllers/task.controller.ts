
import type { Request, Response } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/task.service";

const validPriorities = ["low", "medium", "high"];
const validStatuses = ["todo", "in-progress", "completed"];

export const listTasks = async (req: Request, res: Response) => {
  const projectId = Number(req.query.projectId);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    res.status(400).json({ success: false, message: "Valid projectId is required" });
    return;
  }

  try {
    const tasks = await getTasks(req.user!.userId, projectId);
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("List tasks error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
};

export const addTask = async (req: Request, res: Response) => {
  const { title, description, priority, dueDate } = req.body;
  const projectId = Number(req.body.projectId);

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ success: false, message: "Task title is required" });
    return;
  }

  if (!Number.isInteger(projectId) || projectId <= 0) {
    res.status(400).json({ success: false, message: "Valid projectId is required" });
    return;
  }

  const taskPriority = priority ?? "medium";
  if (!validPriorities.includes(taskPriority)) {
    res.status(400).json({ success: false, message: "Invalid task priority" });
    return;
  }

  const parsedDate =
    dueDate == null || dueDate === "" ? null : new Date(dueDate);

  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    res.status(400).json({ success: false, message: "Invalid due date" });
    return;
  }

  try {
    const task = await createTask(
      req.user!.userId,
      projectId,
      title.trim(),
      typeof description === "string" ? description : "",
      taskPriority,
      parsedDate
    );

    if (!task) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    res.status(201).json({ success: true, message: "Task created", task });
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({ success: false, message: "Failed to create task" });
  }
};

export const editTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.id);
  const { title, description, status, priority, dueDate } = req.body;

  if (!Number.isInteger(taskId) || taskId <= 0) {
    res.status(400).json({ success: false, message: "Invalid task ID" });
    return;
  }

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({ success: false, message: "Task title is required" });
    return;
  }

  const taskStatus = status ?? "todo";
  const taskPriority = priority ?? "medium";

  if (!validStatuses.includes(taskStatus) || !validPriorities.includes(taskPriority)) {
    res.status(400).json({ success: false, message: "Invalid task status or priority" });
    return;
  }

  const parsedDate =
    dueDate == null || dueDate === "" ? null : new Date(dueDate);

  if (parsedDate && Number.isNaN(parsedDate.getTime())) {
    res.status(400).json({ success: false, message: "Invalid due date" });
    return;
  }

  try {
    const task = await updateTask(
      req.user!.userId,
      taskId,
      title.trim(),
      typeof description === "string" ? description : "",
      taskStatus,
      taskPriority,
      parsedDate
    );

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    res.json({ success: true, message: "Task updated", task });
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
};

export const removeTask = async (req: Request, res: Response) => {
  const taskId = Number(req.params.id);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    res.status(400).json({ success: false, message: "Invalid task ID" });
    return;
  }

  try {
    const task = await deleteTask(req.user!.userId, taskId);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({ success: false, message: "Failed to delete task" });
  }
};