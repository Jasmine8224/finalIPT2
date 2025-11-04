import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const Profile = ({ user }) => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const initialTabFromUrl = params.get('tab') || 'info';
    const [activeTab, setActiveTab] = useState(initialTabFromUrl);
    const initialUser = (typeof window !== 'undefined' && window.adminUser) ? window.adminUser : (user || {});
    const initialProfile = (typeof window !== 'undefined' && window.adminProfile) ? window.adminProfile : {};
    const split = (initialUser?.name || '').trim().split(' ');
    const initialFirst = initialProfile?.first_name ?? (split[0] || '');
    const initialLast = initialProfile?.last_name ?? (split.slice(1).join(' ') || '');
    const [form, setForm] = useState({
        first_name: initialFirst,
        last_name: initialLast,
        email: initialUser?.email || '',
        phone: initialProfile?.phone || ''
    });
    // Avatar upload removed per request
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    // Security tab state
    const [archivedStudents, setArchivedStudents] = useState([]);
    const [archivedFaculties, setArchivedFaculties] = useState([]);
    const [archivedCourses, setArchivedCourses] = useState([]);
    const [archivedDepartments, setArchivedDepartments] = useState([]);
    const [archivedAcademicYears, setArchivedAcademicYears] = useState([]);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/profile/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    current_password: passwordForm.current_password,
                    new_password: passwordForm.new_password,
                    new_password_confirmation: passwordForm.new_password_confirmation
                })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
                alert('Password updated successfully.');
            } else {
                const msg = data?.message || 'Failed to update password';
                alert(msg);
            }
        } catch (err) {
            alert('Error updating password');
        }
    };

    const handleChange = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    // Avatar upload removed per request

    const handleSave = async () => {
        try {
            setSaving(true);
            const fd = new FormData();
            fd.append('first_name', form.first_name || '');
            fd.append('last_name', form.last_name || '');
            fd.append('email', form.email || '');
            fd.append('phone', form.phone || '');
            // CSRF + method spoofing for Laravel web routes
            const csrf = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
            fd.append('_token', csrf);
            fd.append('_method', 'PUT');
            // No avatar upload
            const res = await fetch('/api/admin/profile', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrf
                },
                credentials: 'same-origin',
                body: fd
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.success) {
                const u = data.user || {};
                if (typeof window !== 'undefined') window.adminUser = u;
                if (typeof window !== 'undefined') window.adminProfile = {
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    phone: u.phone || ''
                };
                setForm({
                    first_name: u.first_name || '',
                    last_name: u.last_name || '',
                    email: u.email || '',
                    phone: u.phone || ''
                });
                setEditing(false);
                alert('Profile updated successfully');
            } else {
                const errors = data?.errors || {};
                const errList = Object.entries(errors).flatMap(([k, v]) => Array.isArray(v) ? v : [String(v)]);
                const msg = data?.message || (errList.length ? errList.join('\n') : 'Update failed');
                alert(msg);
            }
        } catch (e) {
            alert('Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setForm({
            first_name: initialFirst,
            last_name: initialLast,
            email: initialUser?.email || '',
            phone: initialUser?.phone || ''
        });
        // No avatar state to reset
        setEditing(false);
    };

    // Load archived items provided by backend for Security tab
    useEffect(() => {
        if (typeof window !== 'undefined' && window.archivedItems) {
            const a = window.archivedItems;
            setArchivedStudents(a.students || []);
            setArchivedFaculties(a.faculties || []);
            setArchivedCourses(a.courses || []);
            setArchivedDepartments(a.departments || []);
            setArchivedAcademicYears(a.academic_years || []);
        }
    }, []);

    // Handlers for Security operations (API routes already exist)
    const handleRestoreStudent = async (studentId) => {
        if (confirm('Are you sure you want to restore this student?')) {
            try {
                const res = await fetch(`/api/admin/settings/students/${studentId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedStudents(prev => prev.filter(s => s.id !== studentId));
                    setSuccessMessage('Student restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const e = await res.json().catch(() => ({}));
                    alert(e.message || 'Error restoring student');
                }
            } catch (err) {
                alert('Error restoring student');
            }
        }
    };

    const handleForceDeleteStudent = async (studentId) => {
        if (confirm('Are you sure you want to permanently delete this student? This action cannot be undone.')) {
            try {
                const res = await fetch(`/api/admin/settings/students/${studentId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedStudents(prev => prev.filter(s => s.id !== studentId));
                    setSuccessMessage('Student permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const e = await res.json().catch(() => ({}));
                    alert(e.message || 'Error deleting student');
                }
            } catch (err) {
                alert('Error deleting student');
            }
        }
    };

    const handleRestoreFaculty = async (facultyId) => {
        if (confirm('Are you sure you want to restore this faculty member?')) {
            try {
                const res = await fetch(`/api/admin/settings/faculties/${facultyId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedFaculties(prev => prev.filter(f => f.id !== facultyId));
                    setSuccessMessage('Faculty restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const e = await res.json().catch(() => ({}));
                    alert(e.message || 'Error restoring faculty');
                }
            } catch (err) {
                alert('Error restoring faculty');
            }
        }
    };

    const handleForceDeleteFaculty = async (facultyId) => {
        if (confirm('Are you sure you want to permanently delete this faculty member? This action cannot be undone.')) {
            try {
                const res = await fetch(`/api/admin/settings/faculties/${facultyId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedFaculties(prev => prev.filter(f => f.id !== facultyId));
                    setSuccessMessage('Faculty permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const e = await res.json().catch(() => ({}));
                    alert(e.message || 'Error deleting faculty');
                }
            } catch (err) {
                alert('Error deleting faculty');
            }
        }
    };

    const handleRestoreCourse = async (courseId) => {
        if (confirm('Are you sure you want to restore this course?')) {
            try {
                const res = await fetch(`/api/admin/settings/courses/${courseId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedCourses(prev => prev.filter(c => c.id !== courseId));
                    setSuccessMessage('Course restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error restoring course');
                }
            } catch (err) {
                alert('Error restoring course');
            }
        }
    };

    const handleForceDeleteCourse = async (courseId) => {
        if (confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) {
            try {
                const res = await fetch(`/api/admin/settings/courses/${courseId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedCourses(prev => prev.filter(c => c.id !== courseId));
                    setSuccessMessage('Course permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error deleting course');
                }
            } catch (err) {
                alert('Error deleting course');
            }
        }
    };

    const handleRestoreDepartment = async (departmentId) => {
        if (confirm('Are you sure you want to restore this department?')) {
            try {
                const res = await fetch(`/api/admin/settings/departments/${departmentId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedDepartments(prev => prev.filter(d => d.id !== departmentId));
                    setSuccessMessage('Department restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error restoring department');
                }
            } catch (err) {
                alert('Error restoring department');
            }
        }
    };

    const handleForceDeleteDepartment = async (departmentId) => {
        if (confirm('Are you sure you want to permanently delete this department? This action cannot be undone.')) {
            try {
                const res = await fetch(`/api/admin/settings/departments/${departmentId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedDepartments(prev => prev.filter(d => d.id !== departmentId));
                    setSuccessMessage('Department permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error deleting department');
                }
            } catch (err) {
                alert('Error deleting department');
            }
        }
    };

    const handleRestoreAcademicYear = async (yearId) => {
        if (confirm('Are you sure you want to restore this academic year?')) {
            try {
                const res = await fetch(`/api/admin/settings/academic-years/${yearId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedAcademicYears(prev => prev.filter(y => y.id !== yearId));
                    setSuccessMessage('Academic year restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error restoring academic year');
                }
            } catch (err) {
                alert('Error restoring academic year');
            }
        }
    };

    const handleForceDeleteAcademicYear = async (yearId) => {
        if (confirm('Are you sure you want to permanently delete this academic year? This action cannot be undone.')) {
            try {
                const res = await fetch(`/api/admin/settings/academic-years/${yearId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });
                if (res.ok) {
                    setArchivedAcademicYears(prev => prev.filter(y => y.id !== yearId));
                    setSuccessMessage('Academic year permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error deleting academic year');
                }
            } catch (err) {
                alert('Error deleting academic year');
            }
        }
    };


    return (
        <AdminLayout>
            <div className="profile-card">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <h4 className="mb-0">Profile</h4>
                        <div className="text-muted small">Manage your administrator account</div>
                    </div>
                </div>

                

                <div className="profile-shell">
                    <div className="d-flex gap-2 mb-3">
                        <button className={`btn ${activeTab === 'info' ? 'btn-profile-primary' : 'btn-outline-secondary'}`} onClick={() => handleTabChange('info')}>Personal Information</button>
                        <button className={`btn ${activeTab === 'security' ? 'btn-profile-primary' : 'btn-outline-secondary'}`} onClick={() => handleTabChange('security')}>Archive Report</button>
                    </div>
                    {successMessage && (
                        <div className="alert alert-success py-2">{successMessage}</div>
                    )}
                    {activeTab === 'info' && (
                        <div className="profile-section active">
                            {/* Section header removed as per request */}
                            <div className="profile-info">
                                <div className="profile-header">
                                    <div className="profile-avatar-lg">👤</div>
                                    <div className="profile-details">
                                        <div className="profile-name">{`${form.first_name || ''}${form.last_name ? ' ' : ''}${form.last_name || ''}` || 'Administrator'}</div>
                                        <div className="profile-role">Admin</div>
                                        <div className="profile-email">{form.email}</div>
                                    </div>
                                </div>
                                <div className="profile-fields">
                                    <div className="row g-4">
                                        {/* LEFT: First Name, Email, Phone, Role */}
                                        <div className="col-md-6">
                                            <div className="profile-field">
                                                <label className="field-label">First Name</label>
                                                <input className="form-control profile-input" value={form.first_name} onChange={(e) => handleChange('first_name', e.target.value)} disabled={!editing} />
                                            </div>
                                            <div className="profile-field mt-2">
                                                <label className="field-label">Email Address</label>
                                                <input className="form-control profile-input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} disabled={!editing} />
                                            </div>
                                            <div className="profile-field mt-2">
                                                <label className="field-label">Phone Number</label>
                                                <input className="form-control profile-input" value={form.phone} placeholder="—" onChange={(e) => handleChange('phone', e.target.value)} disabled={!editing} />
                                            </div>
                        					<div className="profile-field mt-2">
                                                <label className="field-label">Role</label>
                                                <input className="form-control profile-input" value="Admin" disabled />
                                            </div>
                                        </div>

                                        {/* RIGHT: Password + Account Created */}
                                        <div className="col-md-6">
                                            <div className="profile-field">
                                                <label className="field-label">Current Password</label>
                                                <input type="password" className="form-control profile-input" placeholder="********" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} />
                                            </div>
                                            <div className="profile-field mt-2">
                                                <label className="field-label">New Password</label>
                                                <input type="password" className="form-control profile-input" placeholder="********" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} />
                                            </div>
                                            <div className="profile-field mt-2">
                                                <label className="field-label">Confirm New Password</label>
                                                <input type="password" className="form-control profile-input" placeholder="********" value={passwordForm.new_password_confirmation} onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })} />
                                            </div>
                                            <div className="d-flex justify-content-end mt-3 mb-3">
                                                <button type="button" onClick={handlePasswordSubmit} className="btn btn-outline-secondary">Update Password</button>
                                            </div>
                                            <div className="profile-field">
                                                <label className="field-label">Account Created</label>
                                                <input className="form-control profile-input" value={initialUser?.created_at ? new Date(initialUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''} disabled />
                                            </div>
                                        </div>
                                        {/* Avatar upload removed */}
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-3">
                                    {!editing ? (
                                        <>
                                            <button className="btn btn-profile-primary" onClick={() => setEditing(true)}>Edit</button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-profile-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                                            <button className="btn btn-outline-secondary" onClick={handleCancel} disabled={saving}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'security' && (
                        <div className="settings-panel">
                            <div className="panel-header">
                                <h5>Archive Report</h5>
                                <p>Manage archived students, faculties, courses, departments, and academic years</p>
                            </div>

                            {/* Archived Students */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Archived Students</h6>
                                        <p className="text-muted small">Students that have been archived can be restored or permanently deleted.</p>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Full Name</th>
                                                        <th>Email</th>
                                                        <th>Department</th>
                                                        <th>Course</th>
                                                        <th>Academic Year</th>
                                                        <th>Archived Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedStudents.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="text-center text-muted py-4">
                                                                <div className="empty-state">
                                                                    <div className="empty-icon">🎓</div>
                                                                    <div className="empty-text">No archived students found</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        archivedStudents.map(student => (
                                                            <tr key={student.id}>
                                                                <td>
                                                                    <span className="badge bg-secondary">#{student.id}</span>
                                                                </td>
                                                                <td>
                                                                    <strong>{student.full_name}</strong>
                                                                    {student.suffix && <small className="text-muted"> {student.suffix}</small>}
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">{student.email || 'N/A'}</small>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-info">{student.department?.name || 'N/A'}</span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-primary">{student.course?.title || 'N/A'}</span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-warning text-dark">{student.academic_year ? `${student.academic_year.start_year}-${student.academic_year.end_year}` : 'N/A'}</span>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">{new Date(student.deleted_at).toLocaleDateString()}</small>
                                                                </td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestoreStudent(student.id)}>Restore</button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleForceDeleteStudent(student.id)}>Delete Permanently</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Archived Faculties */}
                            <div className="row">
                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Archived Faculties</h6>
                                        <p className="text-muted small">Faculty members that have been archived can be restored or permanently deleted.</p>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Full Name</th>
                                                        <th>Email</th>
                                                        <th>Department</th>
                                                        <th>Position</th>
                                                        <th>Contact</th>
                                                        <th>Archived Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedFaculties.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="8" className="text-center text-muted py-4">
                                                                <div className="empty-state">
                                                                    <div className="empty-icon">🧑‍🏫</div>
                                                                    <div className="empty-text">No archived faculties found</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        archivedFaculties.map(faculty => (
                                                            <tr key={faculty.id}>
                                                                <td>
                                                                    <span className="badge bg-secondary">#{faculty.id}</span>
                                                                </td>
                                                                <td>
                                                                    <strong>{faculty.full_name}</strong>
                                                                    {faculty.suffix && <small className="text-muted"> {faculty.suffix}</small>}
                                                                    <br />
                                                                    <small className="text-muted">{faculty.sex}</small>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">{faculty.email || 'N/A'}</small>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-info">{faculty.department?.name || 'N/A'}</span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge bg-success">{faculty.position || 'N/A'}</span>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">{faculty.contact_number || 'N/A'}</small>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">{new Date(faculty.deleted_at).toLocaleDateString()}</small>
                                                                </td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestoreFaculty(faculty.id)}>Restore</button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleForceDeleteFaculty(faculty.id)}>Delete Permanently</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Archived Courses */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Archived Courses</h6>
                                        <p className="text-muted small">Courses that have been archived can be restored or permanently deleted.</p>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Code</th>
                                                        <th>Title</th>
                                                        <th>Department</th>
                                                        <th>Units</th>
                                                        <th>Archived Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedCourses.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted py-4">
                                                                <div className="empty-state">
                                                                    <div className="empty-icon">📚</div>
                                                                    <div className="empty-text">No archived courses found</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        archivedCourses.map(course => (
                                                            <tr key={course.id}>
                                                                <td>{course.code}</td>
                                                                <td>{course.title}</td>
                                                                <td>{course.department?.name}</td>
                                                                <td>{course.units}</td>
                                                                <td>{new Date(course.deleted_at).toLocaleDateString()}</td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestoreCourse(course.id)}>Restore</button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleForceDeleteCourse(course.id)}>Delete Permanently</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Archived Departments */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Archived Departments</h6>
                                        <p className="text-muted small">Departments that have been archived can be restored or permanently deleted.</p>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Code</th>
                                                        <th>Name</th>
                                                        <th>Location</th>
                                                        <th>Archived Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedDepartments.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-muted py-4">
                                                                <div className="empty-state">
                                                                    <div className="empty-icon">🏢</div>
                                                                    <div className="empty-text">No archived departments found</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        archivedDepartments.map(department => (
                                                            <tr key={department.id}>
                                                                <td>{department.code}</td>
                                                                <td>{department.name}</td>
                                                                <td>{department.location || '—'}</td>
                                                                <td>{new Date(department.deleted_at).toLocaleDateString()}</td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestoreDepartment(department.id)}>Restore</button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleForceDeleteDepartment(department.id)}>Delete Permanently</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Archived Academic Years */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Archived Academic Years</h6>
                                        <p className="text-muted small">Academic years that have been archived can be restored or permanently deleted.</p>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Academic Year</th>
                                                        <th>Status</th>
                                                        <th>Archived Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedAcademicYears.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="4" className="text-center text-muted py-4">
                                                                <div className="empty-state">
                                                                    <div className="empty-icon">📅</div>
                                                                    <div className="empty-text">No archived academic years found</div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        archivedAcademicYears.map(year => (
                                                            <tr key={year.id}>
                                                                <td>{year.start_year} - {year.end_year}</td>
                                                                <td>
                                                                    <span className={`status-badge status-${year.status}`}>
                                                                        {year.status}
                                                                    </span>
                                                                </td>
                                                                <td>{new Date(year.deleted_at).toLocaleDateString()}</td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestoreAcademicYear(year.id)}>Restore</button>
                                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleForceDeleteAcademicYear(year.id)}>Delete Permanently</button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Profile;
