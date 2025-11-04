import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const SettingsIndex = () => {
    // Get tab from URL parameters, default to 'courses' (map deprecated 'security' to 'courses')
    const urlParams = new URLSearchParams(window.location.search);
    const rawTab = urlParams.get('tab') || 'courses';
    const initialTab = (rawTab === 'security') ? 'courses' : rawTab;
    const [activeTab, setActiveTab] = useState(initialTab);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [archivedStudents, setArchivedStudents] = useState([]);
    const [archivedFaculties, setArchivedFaculties] = useState([]);
    const [archivedCourses, setArchivedCourses] = useState([]);
    const [archivedDepartments, setArchivedDepartments] = useState([]);
    const [archivedAcademicYears, setArchivedAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states for each tab
    const [courseForm, setCourseForm] = useState({
        code: '',
        title: '',
        units: 3,
        department_id: '',
        status: 'active'
    });

    const [departmentForm, setDepartmentForm] = useState({
        code: '',
        name: '',
        location: '',
        status: 'active'
    });

    const [academicYearForm, setAcademicYearForm] = useState({
        start_year: '',
        end_year: '',
        status: 'active'
    });

    const [formErrors, setFormErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [editingItem, setEditingItem] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [coursesRes, departmentsRes, academicYearsRes] = await Promise.all([
                fetch('/api/admin/courses'),
                fetch('/api/admin/departments'),
                fetch('/api/admin/academic-years')
            ]);

            const [coursesData, departmentsData, academicYearsData] = await Promise.all([
                coursesRes.json(),
                departmentsRes.json(),
                academicYearsRes.json()
            ]);

            setCourses(coursesData.courses || []);
            setDepartments(departmentsData.departments || []);
            setAcademicYears(academicYearsData || []);
            
            // Fetch archived data from server-side data
            if (window.archivedItems) {
                setArchivedStudents(window.archivedItems.students || []);
                setArchivedFaculties(window.archivedItems.faculties || []);
                setArchivedCourses(window.archivedItems.courses || []);
                setArchivedDepartments(window.archivedItems.departments || []);
                setArchivedAcademicYears(window.archivedItems.academic_years || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };


    const handleRestoreStudent = async (studentId) => {
        if (confirm('Are you sure you want to restore this student?')) {
            try {
                const response = await fetch(`/api/admin/settings/students/${studentId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    setArchivedStudents(archivedStudents.filter(student => student.id !== studentId));
                    setSuccessMessage('Student restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error restoring student');
                }
            } catch (error) {
                console.error('Error restoring student:', error);
                alert('Error restoring student');
            }
        }
    };

    const handleForceDeleteStudent = async (studentId) => {
        if (confirm('Are you sure you want to permanently delete this student? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/admin/settings/students/${studentId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    setArchivedStudents(archivedStudents.filter(student => student.id !== studentId));
                    setSuccessMessage('Student permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error deleting student');
                }
            } catch (error) {
                console.error('Error deleting student:', error);
                alert('Error deleting student');
            }
        }
    };

    const handleRestoreFaculty = async (facultyId) => {
        if (confirm('Are you sure you want to restore this faculty member?')) {
            try {
                const response = await fetch(`/api/admin/settings/faculties/${facultyId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    setArchivedFaculties(archivedFaculties.filter(faculty => faculty.id !== facultyId));
                    setSuccessMessage('Faculty restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error restoring faculty');
                }
            } catch (error) {
                console.error('Error restoring faculty:', error);
                alert('Error restoring faculty');
            }
        }
    };

    const handleForceDeleteFaculty = async (facultyId) => {
        if (confirm('Are you sure you want to permanently delete this faculty member? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/admin/settings/faculties/${facultyId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    setArchivedFaculties(archivedFaculties.filter(faculty => faculty.id !== facultyId));
                    setSuccessMessage('Faculty permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error deleting faculty');
                }
            } catch (error) {
                console.error('Error deleting faculty:', error);
                alert('Error deleting faculty');
            }
        }
    };

    // Form submission handlers
    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setLoading(true);

        try {
            const url = editingItem ? `/api/admin/courses/${editingItem.id}` : '/api/admin/courses';
            const method = editingItem ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(courseForm)
            });

            if (response.ok) {
                setSuccessMessage(editingItem ? 'Course updated successfully' : 'Course created successfully');
                setCourseForm({ code: '', title: '', units: 3, department_id: '', status: 'active' });
                setEditingItem(null);
                fetchData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setFormErrors(errorData.errors || {});
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Error saving course');
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setLoading(true);

        try {
            const url = editingItem ? `/api/admin/departments/${editingItem.id}` : '/api/admin/departments';
            const method = editingItem ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(departmentForm)
            });

            if (response.ok) {
                setSuccessMessage(editingItem ? 'Department updated successfully' : 'Department created successfully');
                setDepartmentForm({ code: '', name: '', location: '', status: 'active' });
                setEditingItem(null);
                fetchData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                setFormErrors(errorData.errors || {});
            }
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Error saving department');
        } finally {
            setLoading(false);
        }
    };

    const handleAcademicYearSubmit = async (e) => {
        e.preventDefault();
        setFormErrors({});
        setLoading(true);

        try {
            const url = editingItem ? `/api/admin/academic-years/${editingItem.id}` : '/api/admin/academic-years';
            const method = editingItem ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(academicYearForm)
            });

            if (response.ok) {
                setSuccessMessage(editingItem ? 'Academic year updated successfully' : 'Academic year created successfully');
                setAcademicYearForm({ start_year: '', end_year: '', status: 'active' });
                setEditingItem(null);
                fetchData();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                const errorData = await response.json();
                if (response.status === 422) {
                    // Validation errors
                    setFormErrors(errorData.errors || {});
                    if (errorData.errors && errorData.errors.start_year) {
                        alert('Validation Error: ' + errorData.errors.start_year[0]);
                    }
                } else {
                    // Other errors
                    alert(errorData.message || 'Error saving academic year');
                }
            }
        } catch (error) {
            console.error('Error saving academic year:', error);
            alert('Error saving academic year');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item, type) => {
        setEditingItem(item);
        if (type === 'course') {
            setCourseForm({
                code: item.code || '',
                title: item.title || '',
                units: item.units || 3,
                department_id: item.department_id || '',
                status: item.status || 'active'
            });
        } else if (type === 'department') {
            setDepartmentForm({
                code: item.code || '',
                name: item.name || '',
                location: item.location || '',
                status: item.status || 'active'
            });
        } else if (type === 'academic_year') {
            setAcademicYearForm({
                start_year: item.start_year || '',
                end_year: item.end_year || '',
                status: item.status || 'active'
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
        setCourseForm({ code: '', title: '', units: 3, department_id: '', status: 'active' });
        setDepartmentForm({ code: '', name: '', location: '', status: 'active' });
        setAcademicYearForm({ start_year: '', end_year: '', status: 'active' });
        setFormErrors({});
    };

    const handleArchiveCourse = async (courseId) => {
        if (confirm('Are you sure you want to archive this course?')) {
            try {
                const response = await fetch(`/api/admin/courses/${courseId}/archive`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    setSuccessMessage('Course archived successfully');
                    fetchData();
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error archiving course');
                }
            } catch (error) {
                console.error('Error archiving course:', error);
                alert('Error archiving course');
            }
        }
    };

    const handleArchiveDepartment = async (departmentId) => {
        if (confirm('Are you sure you want to archive this department?')) {
            try {
                const response = await fetch(`/api/admin/departments/${departmentId}/archive`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                if (response.ok) {
                    setSuccessMessage('Department archived successfully');
                    fetchData();
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Error archiving department');
                }
            } catch (error) {
                console.error('Error archiving department:', error);
                alert('Error archiving department');
            }
        }
    };

    const handleRestoreCourse = async (courseId) => {
        if (confirm('Are you sure you want to restore this course?')) {
            try {
                const response = await fetch(`/admin/settings/courses/${courseId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setArchivedCourses(archivedCourses.filter(course => course.id !== courseId));
                    setSuccessMessage('Course restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error restoring course');
                }
            } catch (error) {
                console.error('Error restoring course:', error);
                alert('Error restoring course');
            }
        }
    };

    const handleForceDeleteCourse = async (courseId) => {
        if (confirm('Are you sure you want to permanently delete this course? This action cannot be undone.')) {
            try {
                const response = await fetch(`/admin/settings/courses/${courseId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setArchivedCourses(archivedCourses.filter(course => course.id !== courseId));
                    setSuccessMessage('Course permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error deleting course');
                }
            } catch (error) {
                console.error('Error deleting course:', error);
                alert('Error deleting course');
            }
        }
    };

    const handleRestoreDepartment = async (departmentId) => {
        if (confirm('Are you sure you want to restore this department?')) {
            try {
                const response = await fetch(`/admin/settings/departments/${departmentId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setArchivedDepartments(archivedDepartments.filter(dept => dept.id !== departmentId));
                    setSuccessMessage('Department restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error restoring department');
                }
            } catch (error) {
                console.error('Error restoring department:', error);
                alert('Error restoring department');
            }
        }
    };

    const handleForceDeleteDepartment = async (departmentId) => {
        if (confirm('Are you sure you want to permanently delete this department? This action cannot be undone.')) {
            try {
                const response = await fetch(`/admin/settings/departments/${departmentId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setArchivedDepartments(archivedDepartments.filter(dept => dept.id !== departmentId));
                    setSuccessMessage('Department permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error deleting department');
                }
            } catch (error) {
                console.error('Error deleting department:', error);
                alert('Error deleting department');
            }
        }
    };

    const handleArchive = async (type, id) => {
        if (type === 'academic_year') {
            if (confirm('Are you sure you want to archive this academic year?')) {
                try {
                    const response = await fetch(`/api/admin/settings/academic-years/${id}/archive`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        credentials: 'same-origin'
                    });

                    if (response.ok) {
                        setSuccessMessage('Academic year archived successfully');
                        fetchData();
                        setTimeout(() => setSuccessMessage(''), 3000);
                    } else {
                        const errorData = await response.json();
                        alert(errorData.message || 'Error archiving academic year');
                    }
                } catch (error) {
                    console.error('Error archiving academic year:', error);
                    alert('Error archiving academic year');
                }
            }
        }
    };

    const handleRestoreAcademicYear = async (academicYearId) => {
        if (confirm('Are you sure you want to restore this academic year?')) {
            try {
                const response = await fetch(`/admin/settings/academic-years/${academicYearId}/restore`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setArchivedAcademicYears(archivedAcademicYears.filter(year => year.id !== academicYearId));
                    setSuccessMessage('Academic year restored successfully');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error restoring academic year');
                }
            } catch (error) {
                console.error('Error restoring academic year:', error);
                alert('Error restoring academic year');
            }
        }
    };

    const handleForceDeleteAcademicYear = async (academicYearId) => {
        if (confirm('Are you sure you want to permanently delete this academic year? This action cannot be undone.')) {
            try {
                const response = await fetch(`/admin/settings/academic-years/${academicYearId}/force-delete`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                });

                if (response.ok) {
                    setArchivedAcademicYears(archivedAcademicYears.filter(year => year.id !== academicYearId));
                    setSuccessMessage('Academic year permanently deleted');
                    setTimeout(() => setSuccessMessage(''), 3000);
                } else {
                    alert('Error deleting academic year');
                }
            } catch (error) {
                console.error('Error deleting academic year:', error);
                alert('Error deleting academic year');
            }
        }
    };


    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="mb-0">System Settings</h4>
                    <div className="text-muted small">Configure entities and manage archives</div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {successMessage}
                    <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
                </div>
            )}

            <div className="settings-container">
                {/* Tab Navigation */}
                <div className="settings-tabs">
                    <div className="nav nav-pills">
                        <button 
                            className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
                            onClick={() => handleTabChange('courses')}
                        >
                            📚 Courses
                        </button>
                        <button 
                            className={`nav-link ${activeTab === 'departments' ? 'active' : ''}`}
                            onClick={() => handleTabChange('departments')}
                        >
                            🏢 Departments
                        </button>
                        <button 
                            className={`nav-link ${activeTab === 'academic-years' ? 'active' : ''}`}
                            onClick={() => handleTabChange('academic-years')}
                        >
                            📅 Academic
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="settings-content">
                    {activeTab === 'courses' && (
                        <div className="settings-panel">
                            <div className="panel-header">
                                <h5>Course Management</h5>
                                <p>Add, edit, and archive course information</p>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="form-card">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0">{editingItem ? 'Edit Course' : 'Add New Course'}</h6>
                                            {editingItem && (
                                                <button 
                                                    type="button" 
                                                    className="btn-close"
                                                    onClick={handleCancelEdit}
                                                ></button>
                                            )}
                                        </div>
                                        <form onSubmit={handleCourseSubmit} className="course-inline-form">
                                            <div className="row align-items-end g-3">
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Course Code <span className="text-danger">*</span></label>
                                                        <input type="text" className={`form-control ${formErrors.code ? 'is-invalid' : ''}`} value={courseForm.code} onChange={(e) => setCourseForm({...courseForm, code: e.target.value})} placeholder="e.g., BSIT" required />
                                                        {formErrors.code && <div className="invalid-feedback">{formErrors.code[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Department <span className="text-danger">*</span></label>
                                                        <select className={`form-select ${formErrors.department_id ? 'is-invalid' : ''}`} value={courseForm.department_id} onChange={(e) => setCourseForm({...courseForm, department_id: e.target.value})} required>
                                                            <option value="">Select Department</option>
                                                            {departments.map(dept => (
                                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                                            ))}
                                                        </select>
                                                        {formErrors.department_id && <div className="invalid-feedback">{formErrors.department_id[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Course Title <span className="text-danger">*</span></label>
                                                        <input type="text" className={`form-control ${formErrors.title ? 'is-invalid' : ''}`} value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} placeholder="e.g., Bachelor of Science in Information Technology" required />
                                                        {formErrors.title && <div className="invalid-feedback">{formErrors.title[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Status</label>
                                                        <select className="form-select" value={courseForm.status} onChange={(e) => setCourseForm({...courseForm, status: e.target.value})}>
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Units <span className="text-danger">*</span></label>
                                                        <input type="number" className={`form-control ${formErrors.units ? 'is-invalid' : ''}`} value={courseForm.units} onChange={(e) => setCourseForm({...courseForm, units: parseInt(e.target.value)})} min="1" max="40" required />
                                                        {formErrors.units && <div className="invalid-feedback">{formErrors.units[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg-auto ms-auto d-flex justify-content-end gap-2">
                                                    <button type="submit" className="btn btn-brand" disabled={loading}>
                                                        {loading ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                                {editingItem ? 'Updating...' : 'Add Course'}
                                                            </>
                                                        ) : (
                                                            editingItem ? 'Update Course' : 'Add Course'
                                                        )}
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Existing Courses</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Code</th>
                                                        <th>Title</th>
                                                        <th>Department</th>
                                                        <th>Units</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {courses.map(course => (
                                                        <tr key={course.id}>
                                                            <td>{course.code}</td>
                                                            <td>{course.title}</td>
                                                            <td>{course.department?.name}</td>
                                                            <td>{course.units}</td>
                                                            <td>
                                                                <span className={`status-badge status-${course.status}`}>
                                                                    {course.status}
                                                                </span>
                                                            </td>
                                                            <td className="action-buttons">
                                                                <div className="btn-group" role="group">
                                                                    <button 
                                                                        className="btn btn-sm btn-edit"
                                                                        onClick={() => handleEdit(course, 'course')}
                                                                        title="Edit Course"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-sm btn-archive"
                                                                        onClick={() => handleArchiveCourse(course.id)}
                                                                        title="Archive Course"
                                                                    >
                                                                        Archive
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'departments' && (
                        <div className="settings-panel">
                            <div className="panel-header">
                                <h5>Department Management</h5>
                                <p>Add, edit, and archive department information</p>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="form-card">
                                        <h6>{editingItem ? 'Edit Department' : 'Add New Department'}</h6>
                                        <form onSubmit={handleDepartmentSubmit} className="department-inline-form">
                                            <div className="row align-items-end g-3">
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Department Code <span className="text-danger">*</span></label>
                                                        <input type="text" className={`form-control ${formErrors.code ? 'is-invalid' : ''}`} value={departmentForm.code} onChange={(e) => setDepartmentForm({...departmentForm, code: e.target.value})} placeholder="e.g., CSP" required />
                                                        {formErrors.code && <div className="invalid-feedback">{formErrors.code[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Department Name <span className="text-danger">*</span></label>
                                                        <input type="text" className={`form-control ${formErrors.name ? 'is-invalid' : ''}`} value={departmentForm.name} onChange={(e) => setDepartmentForm({...departmentForm, name: e.target.value})} placeholder="e.g., Computer Studies Program" required />
                                                        {formErrors.name && <div className="invalid-feedback">{formErrors.name[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Location</label>
                                                        <input type="text" className={`form-control ${formErrors.location ? 'is-invalid' : ''}`} value={departmentForm.location} onChange={(e) => setDepartmentForm({...departmentForm, location: e.target.value})} placeholder="CB Building, 2nd Floor" />
                                                        {formErrors.location && <div className="invalid-feedback">{formErrors.location[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Status</label>
                                                        <select className="form-select" value={departmentForm.status} onChange={(e) => setDepartmentForm({...departmentForm, status: e.target.value})}>
                                                            <option value="active">Active</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg-auto ms-auto d-flex justify-content-end gap-2">
                                                    <button type="submit" className="btn btn-brand" disabled={loading}>
                                                        {loading ? 'Saving...' : (editingItem ? 'Update Department' : 'Add Department')}
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Existing Departments</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Code</th>
                                                        <th>Name</th>
                                                        <th>Location</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {departments.map(dept => (
                                                        <tr key={dept.id}>
                                                            <td>{dept.code}</td>
                                                            <td>{dept.name}</td>
                                                            <td>{dept.location || '—'}</td>
                                                            <td>
                                                                <span className={`status-badge status-${dept.status}`}>
                                                                    {dept.status}
                                                                </span>
                                                            </td>
                                                            <td className="action-buttons">
                                                                <div className="btn-group" role="group">
                                                                    <button 
                                                                        className="btn btn-sm btn-edit"
                                                                        onClick={() => handleEdit(dept, 'department')}
                                                                        title="Edit Department"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-sm btn-archive"
                                                                        onClick={() => handleArchiveDepartment(dept.id)}
                                                                        title="Archive Department"
                                                                    >
                                                                        Archive
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'academic-years' && (
                        <div className="settings-panel">
                            <div className="panel-header">
                                <h5>Academic Year Management</h5>
                                <p>Add, edit, and archive academic year information</p>
                            </div>
                            
                            <div className="row g-3">
                                <div className="col-12">
                                    <div className="form-card">
                                        <h6>{editingItem ? 'Edit Academic Year' : 'Add New Academic Year'}</h6>
                                        <form onSubmit={handleAcademicYearSubmit} className="academic-inline-form">
                                            <div className="row align-items-end g-3">
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Start Year *</label>
                                                        <input type="number" className={`form-control ${formErrors.start_year ? 'is-invalid' : ''}`} value={academicYearForm.start_year} onChange={(e) => setAcademicYearForm({...academicYearForm, start_year: e.target.value})} placeholder="e.g., 2025" required />
                                                        {formErrors.start_year && <div className="invalid-feedback">{formErrors.start_year[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">End Year *</label>
                                                        <input type="number" className={`form-control ${formErrors.end_year ? 'is-invalid' : ''}`} value={academicYearForm.end_year} onChange={(e) => setAcademicYearForm({...academicYearForm, end_year: e.target.value})} placeholder="e.g., 2026" required />
                                                        {formErrors.end_year && <div className="invalid-feedback">{formErrors.end_year[0]}</div>}
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg">
                                                    <div className="form-group mb-0">
                                                        <label className="form-label">Status</label>
                                                        <select className="form-select" value={academicYearForm.status} onChange={(e) => setAcademicYearForm({...academicYearForm, status: e.target.value})}>
                                                            <option value="active">Active</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="inactive">Inactive</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-12 col-lg-auto ms-auto d-flex justify-content-end gap-2">
                                                    <button type="submit" className="btn btn-brand" disabled={loading}>
                                                        {loading ? 'Saving...' : (editingItem ? 'Update Academic Year' : 'Add Academic Year')}
                                                    </button>
                                                    <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="table-card">
                                        <h6>Existing Academic Years</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Academic Year</th>
                                                        <th>Period</th>
                                                        <th>Status</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {academicYears.map(year => (
                                                        <tr key={year.id}>
                                                            <td className="fw-bold">{year.start_year}-{year.end_year}</td>
                                                            <td>{year.start_year}/08/2024 - {year.end_year}/05/2025</td>
                                                            <td>
                                                                <span className={`status-badge ${year.status === 'active' ? 'status-active' : year.status === 'completed' ? 'status-completed' : 'status-inactive'}`}>
                                                                    {year.status === 'active' ? 'Active' : year.status === 'completed' ? 'Completed' : 'Inactive'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button 
                                                                    className="btn btn-sm btn-edit me-1"
                                                                    onClick={() => handleEdit(year, 'academic_year')}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-archive"
                                                                    onClick={() => handleArchive('academic_year', year.id)}
                                                                >
                                                                    Archive
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
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

export default SettingsIndex;
