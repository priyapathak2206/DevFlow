import projectRoutes from "./routes/project.routes";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`DevFlow API running on http://localhost:${PORT}`);
});