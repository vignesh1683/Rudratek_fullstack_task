import React from 'react';
import { Calendar, MoreHorizontal } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function ProjectTable({ projects, onSelectProject, selectedProjectId }) {
    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                    <MoreHorizontal size={32} className="text-gray-300" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
                <p className="text-sm text-gray-500">Try adjusting your filters or create a new project.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-4">Project Name</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Start Date</th>
                            <th className="px-6 py-4 text-right"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                onClick={() => onSelectProject(project)}
                                className={`group cursor-pointer hover:bg-gray-50 transition-colors ${selectedProjectId === project.id ? 'bg-indigo-50/60 hover:bg-indigo-50/80' : ''
                                    }`}
                            >
                                <td className="px-6 py-4 font-medium text-gray-900">{project.name}</td>
                                <td className="px-6 py-4 text-gray-600">{project.clientName}</td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={project.status} />
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(project.startDate).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right text-gray-400">
                                    <MoreHorizontal size={18} className="ml-auto opacity-0 group-hover:opacity-100 text-indigo-600 transition-all" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
