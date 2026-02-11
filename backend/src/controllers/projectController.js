const projectService = require('../services/projectService');

/**
 * POST /projects — Create a new project
 */
async function createProject(req, res, next) {
    try {
        const project = projectService.createProject(req.body);
        res.status(201).json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /projects — List all projects with optional filters
 */
async function listProjects(req, res, next) {
    try {
        const { status, search, sortBy, sortOrder } = req.query;
        const projects = projectService.listProjects({ status, search, sortBy, sortOrder });
        res.json({ success: true, data: projects, count: projects.length });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /projects/:id — Get a single project
 */
async function getProjectById(req, res, next) {
    try {
        const project = projectService.getProjectById(req.params.id);
        res.json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
}

/**
 * PATCH /projects/:id/status — Update project status
 */
async function updateProjectStatus(req, res, next) {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: { message: 'Status is required in request body' } });
        }
        const project = projectService.updateProjectStatus(req.params.id, status);
        res.json({ success: true, data: project });
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /projects/:id — Soft delete a project
 */
async function deleteProject(req, res, next) {
    try {
        const result = projectService.deleteProject(req.params.id);
        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createProject,
    listProjects,
    getProjectById,
    updateProjectStatus,
    deleteProject,
};
