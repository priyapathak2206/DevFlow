
import { prisma } from "../config/prisma";

export const getTasks = async (userId: number, projectId: number) => {
  return prisma.task.findMany({
    where: {
      projectId,
      project: { ownerId: userId },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createTask = async (
  userId: number,
  projectId: number,
  title: string,
  description: string,
  priority: string,
  dueDate: Date | null
) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!project) return null;

  return prisma.task.create({
    data: {
      title,
      description: description || null,
      priority,
      dueDate,
      projectId,
    },
  });
};

export const updateTask = async (
  userId: number,
  taskId: number,
  title: string,
  description: string,
  status: string,
  priority: string,
  dueDate: Date | null
) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { ownerId: userId },
    },
  });

  if (!task) return null;

  return prisma.task.update({
    where: { id: taskId },
    data: { title, description: description || null, status, priority, dueDate },
  });
};

export const deleteTask = async (userId: number, taskId: number) => {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: { ownerId: userId },
    },
  });

  if (!task) return null;

  return prisma.task.delete({ where: { id: taskId } });
};