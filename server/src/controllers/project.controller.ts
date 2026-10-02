
import { Request, Response } from "express";
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service";

export const getProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await getAllProjects();

    res.json({
      success: true,
      message: "Projects API",
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};

export const addProject = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Project name is required",
      });
      return;
    }

    const project = await createProject(
      name.trim(),
      typeof description === "string" ? description : "",
      typeof status === "string" && status ? status : "active"
    );

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

export const editProject = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, status } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
      return;
    }

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({
        success: false,
        message: "Project name is required",
      });
      return;
    }

    const project = await updateProject(
      id,
      name.trim(),
      typeof description === "string" ? description : "",
      typeof status === "string" && status ? status : "active"
    );

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

export const removeProject = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
      return;
    }

    const project = await deleteProject(id);

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
      project,
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};