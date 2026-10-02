"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/health", health_routes_1.default);
app.use("/api/projects", project_routes_1.default);
app.listen(PORT, () => {
    console.log(`DevFlow API running on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map