import axios from 'axios';

const api = axios.create({
    baseURL: 'https://rudratek-fullstack-task.vercel.app',
});

export const getProjects = async (params) => {
    const response = await api.get('/projects', { params });
    return response.data;
};

export const getProjectById = async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const createProject = async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
};

export const updateProjectStatus = async (id, status) => {
    const response = await api.patch(`/projects/${id}/status`, { status });
    return response.data;
};

export const deleteProject = async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
};
