import React from 'react';
import { clsx } from 'clsx';

const STATUS_STYLES = {
    active: 'bg-green-100 text-green-800 border-green-200',
    on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

const STATUS_LABELS = {
    active: 'Active',
    on_hold: 'On Hold',
    completed: 'Completed',
};

export function StatusBadge({ status, className }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200',
                className
            )}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );
}
