"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getAllProjects = void 0;
const prisma_1 = require("../config/prisma");
const getAllProjects = async () => {
    return prisma_1.prisma.project.findMany({
        orderBy: { id: "asc" },
    });
};
exports.getAllProjects = getAllProjects;
const createProject = async (name, description, status) => {
    return prisma_1.prisma.project.create({
        data: {
            name,
            description: description || null,
            status: status || "active",
        },
    });
};
exports.createProject = createProject;
const updateProject = async (id, name, description, status) => {
    const existing = await prisma_1.prisma.project.findUnique({
        where: { id },
    });
    if (!existing) {
        return null;
    }
    return prisma_1.prisma.project.update({
        where: { id },
        data: {
            name,
            description: description || null,
            status: status || "active",
        },
    });
};
exports.updateProject = updateProject;
const deleteProject = async (id) => {
    const existing = await prisma_1.prisma.project.findUnique({
        where: { id },
    });
    if (!existing) {
        return null;
    }
    return prisma_1.prisma.project.delete({
        where: { id },
    });
};
exports.deleteProject = deleteProject;
//# sourceMappingURL=project.service.js.map