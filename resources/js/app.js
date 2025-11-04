/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

import './bootstrap';

// Import React and ReactDOM
import React from 'react';
import { createRoot } from 'react-dom/client';

// Import Admin App
import AdminApp from './AdminApp';

// Initialize React components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Admin App if admin container exists
    const adminContainer = document.getElementById('admin-app');
    if (adminContainer) {
        const root = createRoot(adminContainer);
        root.render(<AdminApp />);
    }
});

// Remove old Vue component require
