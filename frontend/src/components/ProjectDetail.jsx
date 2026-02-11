import React, { useState } from 'react';
import { X, Calendar, Trash2, CheckCircle, AlertCircle, PlayCircle, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export function ProjectDetail({ project, onClose, onUpdateStatus, onDelete }) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (!project) return null;

    const validTransitions = {
        active: ['on_hold', 'completed'],
        on_hold: ['active', 'completed'],
        completed: [],
    };

    const transitions = validTransitions[project.status] || [];

    const handleStatusChange = (newStatus) => {
        onUpdateStatus(project.id, newStatus);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            setIsDeleting(true);
            onDelete(project.id);
        }
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col z-40 animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/30">
                <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
                <button
                    onClick={onClose}
                    className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                    <div className="flex items-start justify-between mb-3 gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">{project.name}</h1>
                        <StatusBadge status={project.status} className="px-3 py-1 text-sm shrink-0" />
                    </div>
                    <div className="flex items-center text-lg text-gray-600 font-medium">
                        <span className="text-gray-400 mr-2">Client:</span>
                        {project.clientName}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Date</label>
                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <Calendar size={16} className="text-indigo-500" />
                            {new Date(project.startDate).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Date</label>
                        <div className="flex items-center gap-2 text-gray-900 font-medium">
                            <Clock size={16} className="text-indigo-500" />
                            {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</label>
                    <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-200 shadow-sm min-h-[100px]">
                        {project.description || <span className="text-gray-400 italic">No description provided for this project.</span>}
                    </p>
                </div>

                {transitions.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Update Status</label>
                        <div className="grid grid-cols-2 gap-3">
                            {transitions.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 outline-none"
                                >
                                    {status === 'active' && <PlayCircle size={16} className="text-green-600" />}
                                    {status === 'on_hold' && <AlertCircle size={16} className="text-yellow-600" />}
                                    {status === 'completed' && <CheckCircle size={16} className="text-blue-600 text-bold" />}
                                    <span className="capitalize">{status.replace('_', ' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-6 px-1">
                    <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm font-medium disabled:opacity-50"
                >
                    <Trash2 size={18} />
                    {isDeleting ? 'Deleting Project...' : 'Delete Project'}
                </button>
            </div>
        </div>
    );
}
