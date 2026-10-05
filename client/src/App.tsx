import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Navbar from "./components/Navbar";

const API_URL = "http://localhost:5000/api";

interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  projectId: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("devflow_token") || ""
  );

  const [authMode, setAuthMode] = useState<
    "login" | "register" | "forgot-password" | "reset-password"
  >("login");

  const [resetToken, setResetToken] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState("active");
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [projectMessage, setProjectMessage] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState("todo");

  // Task filters
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskPriorityFilter, setTaskPriorityFilter] = useState("all");

  const [taskMessage, setTaskMessage] = useState("");
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskSaving, setTaskSaving] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setAuthMode("reset-password");
    }
  }, []);

  function logout() {
    localStorage.removeItem("devflow_token");
    setToken("");
    setUser(null);
    setProjects([]);
    setTasks([]);
    setSelectedProjectId("");
    setPassword("");
    setAuthMessage("");
    setProjectMessage("");
    setTaskMessage("");
  }

  async function apiRequest(
    path: string,
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
      logout();
      setAuthMessage("Your session has expired. Please log in again.");
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok || data.success === false) {
      throw new Error(data.message || "The request failed.");
    }

    return data;
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthMessage("");
    setLoading(true);

    let endpoint = "";
    let body: any = {};

    if (authMode === "register") {
      endpoint = "/auth/register";
      body = {
        name: name.trim(),
        email: email.trim(),
        password,
      };
    } else if (authMode === "login") {
      endpoint = "/auth/login";
      body = {
        email: email.trim(),
        password,
      };
    } else if (authMode === "forgot-password") {
      endpoint = "/auth/forgot-password";
      body = {
        email: email.trim(),
      };
    } else if (authMode === "reset-password") {
      endpoint = "/auth/reset-password";
      body = {
        token: resetToken,
        password,
      };
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (authMode === "register") {
        setAuthMessage(
          data.message || "Registration successful. Please log in."
        );
        setAuthMode("login");
        setPassword("");
      } else if (authMode === "forgot-password") {
        setAuthMessage(data.message || "Password reset link sent.");
      } else if (authMode === "reset-password") {
        setAuthMessage(
          data.message || "Password reset successful. Please log in."
        );
        setAuthMode("login");
        setPassword("");
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      } else {
        if (!data.token || !data.user) {
          throw new Error("The server did not return a user and token.");
        }

        localStorage.setItem("devflow_token", data.token);
        setToken(data.token);
        setUser(data.user);
        setPassword("");
        setAuthMessage("");
      }
    } catch (error) {
      setAuthMessage(
        error instanceof Error
          ? error.message
          : "Could not connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadProjects() {
    if (!token) return;

    setProjectsLoading(true);
    setProjectMessage("");

    try {
      const data = await apiRequest("/projects");

      const list = Array.isArray(data.projects)
        ? data.projects
        : Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : null;

      if (!list) {
        throw new Error("Unexpected projects response from the server.");
      }

      setProjects(list);

      setSelectedProjectId((current) => {
        if (
          current &&
          list.some((p: Project) => String(p.id) === current)
        ) {
          return current;
        }

        return list.length ? String(list[0].id) : "";
      });
    } catch (error) {
      if (
        error instanceof Error &&
        !error.message.startsWith("Session expired")
      ) {
        setProjectMessage(error.message);
      }
    } finally {
      setProjectsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadProjects();
    }
  }, [token]);

  async function handleProjectSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) return;

    setProjectMessage("");

    const project = {
      name: projectName.trim(),
      description: description.trim(),
      status: projectStatus,
    };

    if (!project.name) {
      setProjectMessage("Please enter a project name.");
      return;
    }

    try {
      await apiRequest(
        editingProjectId !== null
          ? `/projects/${editingProjectId}`
          : "/projects",
        {
          method: editingProjectId !== null ? "PUT" : "POST",
          body: JSON.stringify(project),
        }
      );

      setProjectName("");
      setDescription("");
      setProjectStatus("active");
      setEditingProjectId(null);

      setProjectMessage(
        editingProjectId !== null
          ? "Project updated successfully."
          : "Project created successfully."
      );

      await loadProjects();
    } catch (error) {
      setProjectMessage(
        error instanceof Error
          ? error.message
          : "Could not save the project."
      );
    }
  }

  function startEditingProject(project: Project) {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setDescription(project.description || "");
    setProjectStatus(project.status || "active");
    setProjectMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelProjectEditing() {
    setEditingProjectId(null);
    setProjectName("");
    setDescription("");
    setProjectStatus("active");
    setProjectMessage("");
  }

  async function deleteProject(id: number) {
    if (
      !window.confirm(
        "Are you sure you want to delete this project and its tasks?"
      )
    ) {
      return;
    }

    setProjectMessage("");

    try {
      await apiRequest(`/projects/${id}`, {
        method: "DELETE",
      });

      if (editingProjectId === id) {
        cancelProjectEditing();
      }

      setProjectMessage("Project deleted successfully.");
      await loadProjects();
    } catch (error) {
      setProjectMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the project."
      );
    }
  }

  async function loadTasks(projectId: string) {
    if (!token || !projectId) {
      setTasks([]);
      return;
    }

    setTasksLoading(true);
    setTaskMessage("");

    try {
      const data = await apiRequest(
        `/tasks?projectId=${encodeURIComponent(projectId)}`
      );

      const list = Array.isArray(data.tasks)
        ? data.tasks
        : Array.isArray(data.data)
          ? data.data
          : [];

      setTasks(list);
    } catch (error) {
      setTasks([]);

      if (
        error instanceof Error &&
        !error.message.startsWith("Session expired")
      ) {
        setTaskMessage(error.message);
      }
    } finally {
      setTasksLoading(false);
    }
  }

  useEffect(() => {
    if (selectedProjectId) {
      void loadTasks(selectedProjectId);
    } else {
      setTasks([]);
    }
  }, [token, selectedProjectId]);

  // Filter tasks by search, status and priority
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(taskSearch.toLowerCase());

    const matchesStatus =
      taskStatusFilter === "all" ||
      task.status === taskStatusFilter;

    const matchesPriority =
      taskPriorityFilter === "all" ||
      task.priority === taskPriorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  function resetTaskForm() {
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskDueDate("");
    setTaskStatus("todo");
  }

  function startEditingTask(task: Task) {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskPriority(task.priority || "medium");
    setTaskStatus(task.status || "todo");
    setTaskDueDate(
      task.dueDate ? task.dueDate.slice(0, 10) : ""
    );
    setTaskMessage("");

    document.getElementById("task-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleTaskSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !selectedProjectId) {
      setTaskMessage("Please create and select a project first.");
      return;
    }

    if (!taskTitle.trim()) {
      setTaskMessage("Please enter a task title.");
      return;
    }

    setTaskSaving(true);
    setTaskMessage("");

    const task = {
      title: taskTitle.trim(),
      description: taskDescription.trim(),
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDueDate || null,
    };

    try {
      if (editingTaskId !== null) {
        await apiRequest(`/tasks/${editingTaskId}`, {
          method: "PUT",
          body: JSON.stringify(task),
        });

        setTaskMessage("Task updated successfully.");
      } else {
        await apiRequest("/tasks", {
          method: "POST",
          body: JSON.stringify({
            ...task,
            projectId: Number(selectedProjectId),
          }),
        });

        setTaskMessage("Task created successfully.");
      }

      resetTaskForm();
      await loadTasks(selectedProjectId);
    } catch (error) {
      setTaskMessage(
        error instanceof Error
          ? error.message
          : "Could not save the task."
      );
    } finally {
      setTaskSaving(false);
    }
  }

  async function changeTaskStatus(
    task: Task,
    newStatus: string
  ) {
    try {
      await apiRequest(`/tasks/${task.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: task.title,
          description: task.description || "",
          status: newStatus,
          priority: task.priority,
          dueDate: task.dueDate
            ? task.dueDate.slice(0, 10)
            : null,
        }),
      });

      await loadTasks(selectedProjectId);
      setTaskMessage("Task status updated.");
    } catch (error) {
      setTaskMessage(
        error instanceof Error
          ? error.message
          : "Could not update task status."
      );
    }
  }

  async function deleteTask(id: number) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await apiRequest(`/tasks/${id}`, {
        method: "DELETE",
      });

      if (editingTaskId === id) {
        resetTaskForm();
      }

      setTaskMessage("Task deleted successfully.");
      await loadTasks(selectedProjectId);
    } catch (error) {
      setTaskMessage(
        error instanceof Error
          ? error.message
          : "Could not delete the task."
      );
    }
  }

  if (!token || !user) {
    return (
      <div className="app">
        <Navbar />

        <main className="auth-main">
          <section className="auth-card">
            <h2>
              {authMode === "login"
                ? "Welcome back"
                : authMode === "register"
                  ? "Create your account"
                  : authMode === "forgot-password"
                    ? "Reset your password"
                    : "Choose a new password"}
            </h2>

            <p>
              {authMode === "login"
                ? "Log in to manage your projects and tasks."
                : authMode === "register"
                  ? "Register to get started with DevFlow."
                  : authMode === "forgot-password"
                    ? "Enter your email and we'll send you a reset link."
                    : "Enter your new password below."}
            </p>

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === "register" && (
                <label>
                  Full name
                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              {authMode !== "reset-password" && (
                <label>
                  Email address
                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    required
                    autoComplete="email"
                  />
                </label>
              )}

              {authMode !== "forgot-password" && (
                <label>
                  {authMode === "reset-password"
                    ? "New Password"
                    : "Password"}

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    required
                    minLength={8}
                    autoComplete={
                      authMode === "login"
                        ? "current-password"
                        : "new-password"
                    }
                  />
                </label>
              )}

              {authMessage && (
                <p className="form-message">
                  {authMessage}
                </p>
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : authMode === "login"
                    ? "Log in"
                    : authMode === "register"
                      ? "Create account"
                      : authMode === "forgot-password"
                        ? "Send reset link"
                        : "Reset password"}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === "login" && (
                <div style={{ marginBottom: "1rem" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("forgot-password");
                      setAuthMessage("");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <span>
                {authMode === "login"
                  ? "Don't have an account? "
                  : authMode === "register"
                    ? "Already have an account? "
                    : ""}
              </span>

              {authMode !== "reset-password" && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(
                      authMode === "login"
                        ? "register"
                        : "login"
                    );
                    setAuthMessage("");
                  }}
                >
                  {authMode === "login"
                    ? "Register"
                    : authMode === "register"
                      ? "Log in"
                      : "Back to login"}
                </button>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar userName={user.name} onLogout={logout} />

      <main className="main">
        <div className="page-header">
          <div>
            <h2>Your workspace</h2>
            <p>
              Welcome, {user.name}. Manage your projects and tasks.
            </p>
          </div>

          <span className="project-count">
            {projects.length}{" "}
            {projects.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <section className="create-section">
          <h3>
            {editingProjectId !== null
              ? "Edit project"
              : "Create a project"}
          </h3>

          <form
            className="project-form"
            onSubmit={handleProjectSubmit}
          >
            <input
              type="text"
              placeholder="Project name"
              value={projectName}
              onChange={(event) =>
                setProjectName(event.target.value)
              }
              required
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />

            <select
              value={projectStatus}
              onChange={(event) =>
                setProjectStatus(event.target.value)
              }
            >
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>

            <div className="form-buttons">
              <button type="submit">
                {editingProjectId !== null
                  ? "Update"
                  : "Create"}
              </button>

              {editingProjectId !== null && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={cancelProjectEditing}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {projectMessage && (
            <p className="form-message">
              {projectMessage}
            </p>
          )}
        </section>

        <section className="projects-section">
          <div className="section-header">
            <h3>All projects</h3>
          </div>

          {projectsLoading ? (
            <p className="empty-message">
              Loading projects...
            </p>
          ) : projects.length === 0 ? (
            <p className="empty-message">
              No projects yet. Create your first project above.
            </p>
          ) : (
            <div className="project-grid">
              {projects.map((project) => (
                <article
                  className="project-card"
                  key={project.id}
                >
                  <div className="project-card-header">
                    <h3>{project.name}</h3>

                    <span
                      className={`status ${project.status}`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p>
                    {project.description ||
                      "No description provided."}
                  </p>

                  <div className="project-card-actions">
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() =>
                        startEditingProject(project)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      type="button"
                      onClick={() =>
                        void deleteProject(project.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="tasks-section">
	<div className="task-stats">
  <div className="task-stat">
    <span>Total</span>
    <strong>{tasks.length}</strong>
  </div>

  <div className="task-stat">
    <span>To Do</span>
    <strong>
      {tasks.filter((task) => task.status === "todo").length}
    </strong>
  </div>

  <div className="task-stat">
    <span>In Progress</span>
    <strong>
      {tasks.filter((task) => task.status === "in-progress").length}
    </strong>
  </div>

  <div className="task-stat">
    <span>Completed</span>
    <strong>
      {tasks.filter((task) => task.status === "completed").length}
    </strong>
  </div>

  <div className="task-stat">
    <span>High Priority</span>
    <strong>
      {tasks.filter((task) => task.priority === "high").length}
    </strong>
  </div>
</div>
          <div className="section-header">
            <div>
              <h3>Task management</h3>
              <p>
                Create tasks and track their progress by project.
              </p>
            </div>

            <span className="project-count">
              {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {projects.length === 0 ? (
            <p className="empty-message">
              Create a project above before adding tasks.
            </p>
          ) : (
            <>
              <label className="task-project-select">
                Select project

                <select
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(
                      event.target.value
                    );
                    resetTaskForm();
                    setTaskMessage("");

                    // Clear filters when changing project
                    setTaskSearch("");
                    setTaskStatusFilter("all");
                    setTaskPriorityFilter("all");
                  }}
                >
                  {projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <div
                className="task-form-card"
                id="task-form"
              >
                <h4>
                  {editingTaskId !== null
                    ? "Edit task"
                    : "Create a task"}
                </h4>

                <form
                  className="task-form"
                  onSubmit={handleTaskSubmit}
                >
                  <label>
                    Task title

                    <input
                      type="text"
                      placeholder="e.g. Design the dashboard"
                      value={taskTitle}
                      onChange={(event) =>
                        setTaskTitle(
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <label>
                    Description

                    <textarea
                      placeholder="What needs to be done?"
                      value={taskDescription}
                      onChange={(event) =>
                        setTaskDescription(
                          event.target.value
                        )
                      }
                      rows={3}
                    />
                  </label>

                  <div className="task-form-row">
                    <label>
                      Priority

                      <select
                        value={taskPriority}
                        onChange={(event) =>
                          setTaskPriority(
                            event.target.value
                          )
                        }
                      >
                        <option value="low">
                          Low
                        </option>
                        <option value="medium">
                          Medium
                        </option>
                        <option value="high">
                          High
                        </option>
                      </select>
                    </label>

                    <label>
                      Due date

                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(event) =>
                          setTaskDueDate(
                            event.target.value
                          )
                        }
                      />
                    </label>

                    {editingTaskId !== null && (
                      <label>
                        Status

                        <select
                          value={taskStatus}
                          onChange={(event) =>
                            setTaskStatus(
                              event.target.value
                            )
                          }
                        >
                          <option value="todo">
                            To Do
                          </option>
                          <option value="in-progress">
                            In Progress
                          </option>
                          <option value="completed">
                            Completed
                          </option>
                        </select>
                      </label>
                    )}
                  </div>

                  <div className="form-buttons">
                    <button
                      type="submit"
                      disabled={taskSaving}
                    >
                      {taskSaving
                        ? "Saving..."
                        : editingTaskId !== null
                          ? "Update task"
                          : "Create task"}
                    </button>

                    {editingTaskId !== null && (
                      <button
                        type="button"
                        className="cancel-button"
                        onClick={resetTaskForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {taskMessage && (
                  <p
                    className="form-message"
                    role="status"
                  >
                    {taskMessage}
                  </p>
                )}
              </div>

              <div className="task-list">
                <h4>Tasks for this project</h4>

                {/* Task Search and Filters */}
                <div className="task-filters">
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearch}
                    onChange={(event) =>
                      setTaskSearch(
                        event.target.value
                      )
                    }
                  />

                  <select
                    value={taskStatusFilter}
                    onChange={(event) =>
                      setTaskStatusFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="all">
                      All Statuses
                    </option>
                    <option value="todo">
                      To Do
                    </option>
                    <option value="in-progress">
                      In Progress
                    </option>
                    <option value="completed">
                      Completed
                    </option>
                  </select>

                  <select
                    value={taskPriorityFilter}
                    onChange={(event) =>
                      setTaskPriorityFilter(
                        event.target.value
                      )
                    }
                  >
                    <option value="all">
                      All Priorities
                    </option>
                    <option value="low">
                      Low
                    </option>
                    <option value="medium">
                      Medium
                    </option>
                    <option value="high">
                      High
                    </option>
                  </select>
                </div>

                {tasksLoading ? (
                  <p className="empty-message">
                    Loading tasks...
                  </p>
                ) : filteredTasks.length === 0 ? (
                  <p className="empty-message">
                    {tasks.length === 0
                      ? "No tasks yet. Create your first task above."
                      : "No tasks match your filters."}
                  </p>
                ) : (
                  filteredTasks.map((task) => (
                    <article
                      className="task-card"
                      key={task.id}
                    >
                      <div className="task-card-top">
                        <div>
                          <h4>{task.title}</h4>

                          <p>
                            {task.description ||
                              "No description provided."}
                          </p>
                        </div>

                        <span
                          className={`priority-badge ${task.priority}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="task-card-meta">
                        <label>
                          Status

                          <select
                            value={task.status}
                            onChange={(event) =>
                              void changeTaskStatus(
                                task,
                                event.target.value
                              )
                            }
                          >
                            <option value="todo">
                              To Do
                            </option>
                            <option value="in-progress">
                              In Progress
                            </option>
                            <option value="completed">
                              Completed
                            </option>
                          </select>
                        </label>

                        <span className="task-due-date">
                          Due:{" "}
                          {task.dueDate
                            ? task.dueDate.slice(0, 10)
                            : "Not set"}
                        </span>
                      </div>

                      <div className="project-card-actions">
                        <button
                          className="edit-button"
                          type="button"
                          onClick={() =>
                            startEditingTask(task)
                          }
                        >
                          Edit task
                        </button>

                        <button
                          className="delete-button"
                          type="button"
                          onClick={() =>
                            void deleteTask(task.id)
                          }
                        >
                          Delete task
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;