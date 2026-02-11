const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// Valid status transition map
const VALID_TRANSITIONS = {
    active: ['on_hold', 'completed'],
    on_hold: ['active', 'completed'],
    completed: [], // No transitions allowed from completed
};

const VALID_STATUSES = ['active', 'on_hold', 'completed'];

/**
 * Create a new project.
 */
function createProject({ name, clientName, status, startDate, endDate, description }) {
    // Validate required fields
    if (!name || !name.trim()) {
        throw new AppError('Project name is required', 400);
    }
    if (!clientName || !clientName.trim()) {
        throw new AppError('Client name is required', 400);
    }
    if (!startDate) {
        throw new AppError('Start date is required', 400);
    }

    // Validate date format (YYYY-MM-DD) and year length
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
        throw new AppError('Start date must be in YYYY-MM-DD format', 400);
    }
    const startYear = parseInt(startDate.split('-')[0]);
    if (startYear < 1000 || startYear > 9999) {
        throw new AppError('Start date year must be between 1000 and 9999', 400);
    }

    if (endDate) {
        if (!dateRegex.test(endDate)) {
            throw new AppError('End date must be in YYYY-MM-DD format', 400);
        }
        const endYear = parseInt(endDate.split('-')[0]);
        if (endYear < 1000 || endYear > 9999) {
            throw new AppError('End date year must be between 1000 and 9999', 400);
        }
    }

    // Default status to 'active' if not provided
    const projectStatus = status || 'active';

    if (!VALID_STATUSES.includes(projectStatus)) {
        throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    // Validate endDate >= startDate
    if (endDate && new Date(endDate) < new Date(startDate)) {
        throw new AppError('End date must be on or after the start date', 400);
    }

    const now = new Date().toISOString();
    const id = uuidv4();

    const stmt = db.prepare(`
    INSERT INTO projects (id, name, clientName, status, startDate, endDate, description, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(id, name.trim(), clientName.trim(), projectStatus, startDate, endDate || null, description || null, now, now);

    return getProjectById(id);
}

/**
 * List projects with optional filters, search, and sorting.
 */
function listProjects({ status, search, sortBy = 'createdAt', sortOrder = 'desc' }) {
    let query = 'SELECT * FROM projects WHERE deletedAt IS NULL';
    const params = [];

    // Status filter
    if (status) {
        if (!VALID_STATUSES.includes(status)) {
            throw new AppError(`Invalid status filter. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
        }
        query += ' AND status = ?';
        params.push(status);
    }

    // Search filter (name or clientName)
    if (search && search.trim()) {
        query += ' AND (name LIKE ? OR clientName LIKE ?)';
        const searchTerm = `%${search.trim()}%`;
        params.push(searchTerm, searchTerm);
    }

    // Sorting
    const allowedSortFields = ['createdAt', 'startDate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${sortField} ${order}`;

    const stmt = db.prepare(query);
    return stmt.all(...params);
}

/**
 * Get a single project by ID.
 */
function getProjectById(id) {
    const stmt = db.prepare('SELECT * FROM projects WHERE id = ? AND deletedAt IS NULL');
    const project = stmt.get(id);

    if (!project) {
        throw new AppError('Project not found', 404);
    }

    return project;
}

/**
 * Update a project's status with transition validation.
 */
function updateProjectStatus(id, newStatus) {
    const project = getProjectById(id); // Will throw 404 if not found

    if (!VALID_STATUSES.includes(newStatus)) {
        throw new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400);
    }

    const allowedTransitions = VALID_TRANSITIONS[project.status];

    if (!allowedTransitions.includes(newStatus)) {
        if (project.status === 'completed') {
            throw new AppError('Cannot transition from completed status', 400);
        }
        throw new AppError(
            `Invalid status transition: '${project.status}' → '${newStatus}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`,
            400
        );
    }

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE projects SET status = ?, updatedAt = ? WHERE id = ?');
    stmt.run(newStatus, now, id);

    return getProjectById(id);
}

/**
 * Soft delete a project.
 */
function deleteProject(id) {
    const project = getProjectById(id); // Will throw 404 if not found

    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE projects SET deletedAt = ?, updatedAt = ? WHERE id = ?');
    stmt.run(now, now, id);

    return { message: 'Project deleted successfully', id };
}

module.exports = {
    createProject,
    listProjects,
    getProjectById,
    updateProjectStatus,
    deleteProject,
};
