export declare const getAllProjects: () => Promise<{
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}[]>;
export declare const createProject: (name: string, description: string, status: string) => Promise<{
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}>;
export declare const updateProject: (id: number, name: string, description: string, status: string) => Promise<{
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
} | null>;
export declare const deleteProject: (id: number) => Promise<{
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
} | null>;
//# sourceMappingURL=project.service.d.ts.map