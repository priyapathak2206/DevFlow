"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "DevFlow API is running",
    });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map