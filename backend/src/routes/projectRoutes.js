const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// POST /projects — Create a new project
router.post('/', projectController.createProject);

// GET /projects — List all projects (with optional filters, search, sort)
router.get('/', projectController.listProjects);

// GET /projects/:id — Get a single project by ID
router.get('/:id', projectController.getProjectById);

// PATCH /projects/:id/status — Update project status
router.patch('/:id/status', projectController.updateProjectStatus);

// DELETE /projects/:id — Soft delete a project
router.delete('/:id', projectController.deleteProject);

module.exports = router;
