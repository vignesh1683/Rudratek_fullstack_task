import { useState, useCallback, useEffect } from 'react';
import { getProjects, getProjectById, createProject, updateProjectStatus, deleteProject } from '../api/projectApi';

export function useProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc',
    });

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProjects(filters);
            setProjects(data.data);
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Initial fetch when filters change
    useEffect(() => {
        // Debounce search slightly to avoid too many requests
        const timer = setTimeout(() => {
            fetchProjects();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchProjects]);

    const addProject = async (projectData) => {
        try {
            await createProject(projectData);
            await fetchProjects(); // Refresh list
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error?.message || 'Failed to create project' };
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await updateProjectStatus(id, newStatus);
            await fetchProjects(); // Refresh list
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error?.message || 'Failed to update status' };
        }
    };

    const removeProject = async (id) => {
        try {
            await deleteProject(id);
            await fetchProjects(); // Refresh list
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.error?.message || 'Failed to delete project' };
        }
    };

    return {
        projects,
        loading,
        error,
        filters,
        setFilters,
        refresh: fetchProjects,
        addProject,
        updateStatus,
        removeProject,
    };
}
