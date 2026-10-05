import { prisma } from "../config/prisma";

export const getAllProjects = async (userId: number) => {
  return prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { id: "asc" },
  });
};

export const createProject = async (
  userId: number,
  name: string,
  description: string,
  status: string
) => {
  return prisma.project.create({
    data: {
      name,
      description: description || null,
      status: status || "active",
      ownerId: userId,
    },
  });
};

export const updateProject = async (
  userId: number,
  id: number,
  name: string,
  description: string,
  status: string
) => {
  const existing = await prisma.project.findFirst({
    where: { id, ownerId: userId },
  });

  if (!existing) return null;

  return prisma.project.update({
    where: { id },
    data: {
      name,
      description: description || null,
      status: status || "active",
    },
  });
};

export const deleteProject = async (userId: number, id: number) => {
  const existing = await prisma.project.findFirst({
    where: { id, ownerId: userId },
  });

  if (!existing) return null;

  return prisma.project.delete({
    where: { id },
  });
};