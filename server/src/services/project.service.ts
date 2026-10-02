
import { prisma } from "../config/prisma";

export const getAllProjects = async () => {
  return prisma.project.findMany({
    orderBy: { id: "asc" },
  });
};

export const createProject = async (
  name: string,
  description: string,
  status: string
) => {
  return prisma.project.create({
    data: {
      name,
      description: description || null,
      status: status || "active",
    },
  });
};

export const updateProject = async (
  id: number,
  name: string,
  description: string,
  status: string
) => {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  return prisma.project.update({
    where: { id },
    data: {
      name,
      description: description || null,
      status: status || "active",
    },
  });
};

export const deleteProject = async (id: number) => {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    return null;
  }

  return prisma.project.delete({
    where: { id },
  });
};