"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProject = exports.editProject = exports.addProject = exports.getProjects = void 0;
const express_1 = require("express");
const project_service_1 = require("../services/project.service");
const getProjects = async (_req, res) => {
    try {
        const projects = await (0, project_service_1.getAllProjects)();
        res.json({
            success: true,
            message: "Projects API",
            projects,
        });
    }
    catch (error) {
        console.error("Get projects error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
        });
    }
};
exports.getProjects = getProjects;
const addProject = async (req, res) => {
    try {
        const { name, description, status } = req.body;
        if (typeof name !== "string" || !name.trim()) {
            res.status(400).json({
                success: false,
                message: "Project name is required",
            });
            return;
        }
        const project = await (0, project_service_1.createProject)(name.trim(), typeof description === "string" ? description : "", typeof status === "string" && status ? status : "active");
        res.status(201).json({
            success: true,
            message: "Project created successfully",
            project,
        });
    }
    catch (error) {
        console.error("Create project error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create project",
        });
    }
};
exports.addProject = addProject;
const editProject = async (req, res) => {
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
        const project = await (0, project_service_1.updateProject)(id, name.trim(), typeof description === "string" ? description : "", typeof status === "string" && status ? status : "active");
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
    }
    catch (error) {
        console.error("Update project error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update project",
        });
    }
};
exports.editProject = editProject;
const removeProject = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
            return;
        }
        const project = await (0, project_service_1.deleteProject)(id);
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
    }
    catch (error) {
        console.error("Delete project error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete project",
        });
    }
};
exports.removeProject = removeProject;
//# sourceMappingURL=project.controller.js.map