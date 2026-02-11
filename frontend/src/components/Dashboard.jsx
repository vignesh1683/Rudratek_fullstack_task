import React, { useState } from 'react';
import { Plus, Search, Filter, LayoutDashboard } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { ProjectTable } from './ProjectTable';
import { ProjectDetail } from './ProjectDetail';
import { CreateProjectModal } from './CreateProjectModal';

export function Dashboard() {
    const {
        projects,
        loading,
        error,
        filters,
        setFilters,
        addProject,
        updateStatus,
        removeProject,
    } = useProjects();

    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectProject = (project) => {
        setSelectedProject(project);
    };

    const handleCloseDetail = () => {
        setSelectedProject(null);
    };

    const handleCreate = async (data) => {
        return await addProject(data);
    };

    const handleUpdateStatus = async (id, status) => {
        const result = await updateStatus(id, status);
        if (result.success && selectedProject) {
            // Update local selected project status immediately for UI responsiveness
            setSelectedProject(prev => ({ ...prev, status, updatedAt: new Date().toISOString() }));
        }
    };

    const handleDelete = async (id) => {
        const result = await removeProject(id);
        if (result.success) {
            setSelectedProject(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Navbar */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <LayoutDashboard size={20} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Project Tracker</h1>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm transition-all text-sm font-medium focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Plus size={18} />
                        New Project
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters Bar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full md:w-48 pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-sm appearance-none cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="on_hold">On Hold</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading / Error / Content */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2">
                        <span className="font-semibold">Error:</span> {error}
                    </div>
                )}

                {loading && projects.length === 0 ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="flex gap-6 relative">
                        <div className={`flex-1 transition-all duration-300 ${selectedProject ? 'mr-0' : ''}`}>
                            <ProjectTable
                                projects={projects}
                                onSelectProject={handleSelectProject}
                                selectedProjectId={selectedProject?.id}
                            />
                        </div>

                        {/* Overlay backdrop for mobile when detail is open */}
                        {selectedProject && (
                            <div
                                className="fixed inset-0 bg-black/20 z-30 md:hidden"
                                onClick={handleCloseDetail}
                            />
                        )}

                        {selectedProject && (
                            <ProjectDetail
                                project={selectedProject}
                                onClose={handleCloseDetail}
                                onUpdateStatus={handleUpdateStatus}
                                onDelete={handleDelete}
                            />
                        )}
                    </div>
                )}
            </main>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
            />
        </div>
    );
}
