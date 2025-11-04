import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const CoursesIndex = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        q: ''
    });
    const [loading, setLoading] = useState(true);
    const [editingCourse, setEditingCourse] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        title: '',
        units: '',
        department_id: '',
        status: 'active'
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, [filters]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/courses?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            console.log('Courses API Response:', data); // Debug log
            
            if (data.error) {
                console.error('Courses API Error:', data.error);
            }
            
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            console.log('🔍 Fetching departments...');
            const response = await fetch('/api/admin/departments', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            
            console.log('📡 Departments response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('📊 Departments data received:', data);
                setDepartments(data.departments || []);
                console.log('✅ Departments set in state:', data.departments?.length || 0, 'items');
            } else {
                console.error('❌ Failed to fetch departments:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('Error response:', errorText);
            }
        } catch (error) {
            console.error('💥 Error fetching departments:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleAddNew = () => {
        setFormData({
            code: '',
            title: '',
            units: '',
            department_id: '',
            status: 'active'
        });
        setEditingCourse(null);
        setShowAddForm(true);
        setErrors({});
    };

    const handleEdit = (course) => {
        setFormData({
            code: course.code || '',
            title: course.title || '',
            units: course.units || '',
            department_id: course.department_id || '',
            status: course.status || 'active'
        });
        setEditingCourse(course.id);
        setShowAddForm(false);
        setErrors({});
    };

    const handleCancel = () => {
        setEditingCourse(null);
        setShowAddForm(false);
        setFormData({
            code: '',
            title: '',
            units: '',
            department_id: '',
            status: 'active'
        });
        setErrors({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        console.log('🚀 Form submission started');
        console.log('📝 Form data:', formData);
        console.log('🏢 Available departments:', departments.length);

        try {
            const url = editingCourse ? `/api/admin/courses/${editingCourse}` : '/api/admin/courses';
            const method = editingCourse ? 'PUT' : 'POST';
            
            console.log('🎯 Making request to:', url, 'with method:', method);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(formData)
            });

            console.log('📡 Response status:', response.status, response.statusText);
            const data = await response.json();
            console.log('📊 Response data:', data);

            if (response.ok && data.success) {
                console.log('✅ Course saved successfully!');
                alert(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
                handleCancel();
                fetchCourses();
            } else {
                console.log('❌ Save failed:', data);
                if (data.errors) {
                    console.log('🚫 Validation errors:', data.errors);
                    setErrors(data.errors);
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                }
            }
        } catch (error) {
            console.error('💥 Error saving course:', error);
            alert('Error saving course. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (courseId) => {
        if (confirm('Archive this course?')) {
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

                const data = await response.json();

                if (response.ok) {
                    alert('Course archived successfully!');
                    fetchCourses();
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                }
            } catch (error) {
                console.error('Error archiving course:', error);
                alert('Error archiving course. Please try again.');
            }
        }
    };


    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="mb-0">Courses</h4>
                    <div className="text-muted small">Create and manage course offerings</div>
                </div>
                <button onClick={handleAddNew} className="btn btn-sm btn-brand">＋ Add New Course</button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingCourse) && (
                <div className="card mb-4">
                    <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{editingCourse ? 'Edit Course' : 'Add New Course'}</h5>
                            <button onClick={handleCancel} className="btn btn-sm btn-outline-secondary">Cancel</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Course Code *</label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                            placeholder="e.g., BSIT"
                                            required
                                        />
                                        {errors.code && <div className="invalid-feedback">{errors.code[0]}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Units *</label>
                                        <input
                                            type="number"
                                            name="units"
                                            value={formData.units}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.units ? 'is-invalid' : ''}`}
                                            placeholder="3"
                                            min="1"
                                            max="6"
                                            required
                                        />
                                        {errors.units && <div className="invalid-feedback">{errors.units[0]}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Course Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    placeholder="e.g., Bachelor of Science in Information Technology"
                                    required
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title[0]}</div>}
                            </div>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Department *</label>
                                        <select
                                            name="department_id"
                                            value={formData.department_id}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.department_id ? 'is-invalid' : ''}`}
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                                            ))}
                                        </select>
                                        {errors.department_id && <div className="invalid-feedback">{errors.department_id[0]}</div>}
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Status *</label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.status ? 'is-invalid' : ''}`}
                                            required
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <div className="invalid-feedback">{errors.status[0]}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingCourse ? 'Update Course' : 'Add Course')}
                                </button>
                                <button type="button" onClick={handleCancel} className="btn btn-outline-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <form className="course-filters">
                <div className="row filter-row">
                    <div className="col-auto">
                        <input 
                            type="text" 
                            value={filters.q}
                            onChange={(e) => handleFilterChange('q', e.target.value)}
                            className="form-control filter-input" 
                            placeholder="Search by Code/Title" 
                        />
                    </div>
                    <div className="col-auto">
                        <button type="button" className="btn btn-outline-secondary">Search</button>
                    </div>
                </div>
            </form>

            <div className="courses-table">
                <div className="course-card card shadow-sm">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
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
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : courses.length > 0 ? (
                                    courses.map(course => (
                                        <tr key={course.id}>
                                            <td className="course-code">{course.code}</td>
                                            <td className="course-title">{course.title}</td>
                                            <td>{course.department?.name || '—'}</td>
                                            <td className="course-units">{course.units}</td>
                                            <td>
                                                <span className={`status-badge status-${course.status?.toLowerCase()}`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button 
                                                        onClick={() => handleEdit(course)}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleArchive(course.id)}
                                                        className="btn btn-outline-danger btn-sm"
                                                    >
                                                        Archive
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            <div className="empty-icon">📚</div>
                                            <div className="empty-message">No courses found</div>
                                            <div className="empty-submessage">Try adjusting your search criteria</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default CoursesIndex;
