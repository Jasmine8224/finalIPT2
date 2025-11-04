import React from 'react';
import { createRoot } from 'react-dom/client';
import Dashboard from './components/Dashboard';
import StudentsIndex from './components/StudentsIndex';
import StudentForm from './components/StudentForm';
import FacultiesIndex from './components/FacultiesIndex';
import FacultyForm from './components/FacultyForm';
import CoursesIndex from './components/CoursesIndex';
import DepartmentsIndex from './components/DepartmentsIndex';
import CoursesView from './components/CoursesView';
import DepartmentsView from './components/DepartmentsView';
import ReportsIndex from './components/ReportsIndex';
import Profile from './components/Profile';
import SettingsIndex from './components/SettingsIndex';

// Simple router based on current path
const AdminApp = () => {
    const path = window.location.pathname;
    const user = window.adminUser || {};
    const stats = window.adminStats || {};
    const editData = window.editData || {};

    const renderComponent = () => {
        // Handle edit routes with dynamic IDs
        if (path.match(/^\/admin\/students\/\d+\/edit$/)) {
            return <StudentForm isEdit={true} student={editData.student} />;
        }
        if (path.match(/^\/admin\/faculties\/\d+\/edit$/)) {
            return <FacultyForm isEdit={true} faculty={editData.faculty} />;
        }
        if (path.match(/^\/admin\/courses\/\d+\/edit$/)) {
            return <div>Course editing not yet implemented</div>; // Placeholder
        }
        if (path.match(/^\/admin\/departments\/\d+\/edit$/)) {
            return <div>Department editing not yet implemented</div>; // Placeholder
        }

        switch (path) {
            case '/admin/dashboard':
                return <Dashboard stats={stats} />;
            case '/admin/students':
                return <StudentsIndex />;
            case '/admin/students/create':
                return <StudentForm isEdit={false} />;
            case '/admin/faculties':
                return <FacultiesIndex />;
            case '/admin/faculties/create':
                return <FacultyForm isEdit={false} />;
            case '/admin/courses':
                return <CoursesView />;
            case '/admin/departments':
                return <DepartmentsView />;
            case '/admin/reports':
                return <ReportsIndex />;
            case '/admin/profile':
                return <Profile user={user} />;
            case '/admin/settings':
                return <SettingsIndex />;
            default:
                return <Dashboard stats={stats} />;
        }
    };

    return (
        <div className="admin-app">
            {renderComponent()}
        </div>
    );
};

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const adminRoot = document.getElementById('admin-app');
    if (adminRoot) {
        const root = createRoot(adminRoot);
        root.render(<AdminApp />);
    }
});

export default AdminApp;
