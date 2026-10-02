import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
}

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const loadProjects = () => {
    fetch("http://localhost:5000/api/projects")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setProjects(data.projects);
        }
      })
      .catch(() => {
        setProjects([]);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const clearForm = () => {
    setName("");
    setDescription("");
    setStatus("active");
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Project name is required");
      return;
    }

    const url =
      editingId === null
        ? "http://localhost:5000/api/projects"
        : `http://localhost:5000/api/projects/${editingId}`;

    const method = editingId === null ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(
          editingId === null
            ? "Project created"
            : "Project updated"
        );

        clearForm();
        loadProjects();
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      setMessage("Backend unavailable");
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setName(project.name);
    setDescription(project.description);
    setStatus(project.status);
    setMessage("");
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Project deleted");

        if (editingId === id) {
          clearForm();
        }

        loadProjects();
      } else {
        setMessage(data.message || "Failed to delete project");
      }
    } catch {
      setMessage("Failed to delete project");
    }
  };

  return (
    <div className="app">
      <Navbar />

      <main className="main">
        <div className="page-header">
          <div>
            <h2>Projects</h2>
            <p>Manage your projects</p>
          </div>

          <span className="project-count">
            {projects.length} Projects
          </span>
        </div>

        <section className="create-section">
          <h3>
            {editingId === null ? "Create Project" : "Edit Project"}
          </h3>

          <form onSubmit={handleSubmit} className="project-form">
            <input
              type="text"
              placeholder="Project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>

            <div className="form-buttons">
              <button type="submit">
                {editingId === null ? "Create" : "Update"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && <p className="form-message">{message}</p>}
        </section>

        <section className="projects-section">
          <div className="section-header">
            <h3>All Projects</h3>
          </div>

          <div className="project-grid">
            {projects.length === 0 ? (
              <p className="empty-message">No projects found.</p>
            ) : (
              projects.map((project) => (
                <div className="project-card" key={project.id}>
                  <div className="project-card-header">
                    <h3>{project.name}</h3>

                    <span className={`status ${project.status}`}>
                      {project.status}
                    </span>
                  </div>

                  <p>
                    {project.description || "No description provided"}
                  </p>

                  <div className="project-card-actions">
                    <button
                      className="edit-button"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;