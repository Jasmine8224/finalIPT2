import React from 'react';

const AdminLayout = ({ children, user }) => {
    const handleSignOut = () => {
        // Create a form and submit it for logout
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/logout';
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        
        form.appendChild(csrfInput);
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="admin-shell">
            <h1 className="edu-heading-inline">EduCore</h1>
            <div className="row g-3">
                <div className="col-md-3">
                    <div className="side-card p-3">
                        <div className="side-heading">Admin Dashboard</div>
                        
                        <a href="/admin/dashboard" className={`side-link ${window.location.pathname === '/admin/dashboard' || window.location.pathname === '/admin' ? 'active' : ''}`}>
                            <span>📊</span> Dashboard
                        </a>
                        
                        <a href="/admin/students" className={`side-link ${window.location.pathname === '/admin/students' ? 'active' : ''}`}>
                            <span>🎓</span> Student
                        </a>
                        
                        <a href="/admin/faculties" className={`side-link ${window.location.pathname === '/admin/faculties' ? 'active' : ''}`}>
                            <span>🧑‍🏫</span> Faculty
                        </a>
                        
                        <a href="/admin/reports" className={`side-link ${window.location.pathname === '/admin/reports' ? 'active' : ''}`}>
                            <span>📋</span> Reports
                        </a>
                        
                        <a href="/admin/settings" className={`side-link ${window.location.pathname === '/admin/settings' ? 'active' : ''}`}>
                            <span>⚙️</span> System Settings
                        </a>
                        
                        <div className="side-footer mt-4">
                            <a href="/admin/profile" className="admin-section d-flex align-items-center" style={{ textDecoration: 'none', color: 'inherit', gap: '8px' }}>
                                <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>👤</span>
                                <div>
                                    <div className="fw-semibold" style={{ lineHeight: 1.2 }}>My Profile</div>
                                    <div className="small text-muted" style={{ lineHeight: 1.2 }}>Admin</div>
                                </div>
                            </a>
                            <button 
                                onClick={handleSignOut}
                                className="btn btn-link text-danger p-0 mt-2"
                                style={{ fontSize: '0.95rem', textDecoration: 'none' }}
                            >
                                <span aria-hidden="true" className="me-1">↪</span> Sign Out
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-9">
                    <div className="mini-card p-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
