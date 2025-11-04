import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const DepartmentsIndex = () => {
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        q: ''
    });
    const [loading, setLoading] = useState(true);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        location: '',
        status: 'active'
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, [filters]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/departments?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            console.log('Departments API Response:', data); // Debug log
            
            if (data.error) {
                console.error('Departments API Error:', data.error);
            }
            
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoading(false);
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
            name: '',
            code: '',
            location: '',
            status: 'active'
        });
        setEditingDepartment(null);
        setShowAddForm(true);
        setErrors({});
    };

    const handleEdit = (department) => {
        setFormData({
            name: department.name || '',
            code: department.code || '',
            location: department.location || '',
            status: department.status || 'active'
        });
        setEditingDepartment(department.id);
        setShowAddForm(false);
        setErrors({});
    };

    const handleCancel = () => {
        setEditingDepartment(null);
        setShowAddForm(false);
        setFormData({
            name: '',
            code: '',
            location: '',
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

        try {
            const url = editingDepartment ? `/api/admin/departments/${editingDepartment}` : '/api/admin/departments';
            const method = editingDepartment ? 'PUT' : 'POST';
            
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

            const data = await response.json();

            if (response.ok && data.success) {
                alert(editingDepartment ? 'Department updated successfully!' : 'Department created successfully!');
                handleCancel();
                fetchDepartments();
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                }
            }
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Error saving department. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (departmentId) => {
        if (confirm('Archive this department?')) {
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

                const data = await response.json();

                if (response.ok) {
                    alert('Department archived successfully!');
                    fetchDepartments();
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                }
            } catch (error) {
                console.error('Error archiving department:', error);
                alert('Error archiving department. Please try again.');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="mb-0">Departments</h4>
                    <div className="text-muted small">Organize academic departments</div>
                </div>
                <button onClick={handleAddNew} className="btn btn-sm btn-brand">＋ Add New Department</button>
            </div>

            {/* Add/Edit Form */}
            {(showAddForm || editingDepartment) && (
                <div className="card mb-4">
                    <div className="card-header">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{editingDepartment ? 'Edit Department' : 'Add New Department'}</h5>
                            <button onClick={handleCancel} className="btn btn-sm btn-outline-secondary">Cancel</button>
                        </div>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group mb-3">
                                        <label className="form-label">Department Code *</label>
                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleInputChange}
                                            className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                                            placeholder="e.g., CSP"
                                            required
                                        />
                                        {errors.code && <div className="invalid-feedback">{errors.code[0]}</div>}
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
                            <div className="form-group mb-3">
                                <label className="form-label">Department Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                    placeholder="Computer Studies Program"
                                    required
                                />
                                {errors.name && <div className="invalid-feedback">{errors.name[0]}</div>}
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                    placeholder="CB Building, 2nd Floor"
                                />
                                {errors.location && <div className="invalid-feedback">{errors.location[0]}</div>}
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : (editingDepartment ? 'Update Department' : 'Add Department')}
                                </button>
                                <button type="button" onClick={handleCancel} className="btn btn-outline-secondary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <form className="department-filters">
                <div className="row filter-row">
                    <div className="col-auto">
                        <input 
                            type="text" 
                            value={filters.q}
                            onChange={(e) => handleFilterChange('q', e.target.value)}
                            className="form-control filter-input" 
                            placeholder="Search by Name/Code" 
                        />
                    </div>
                    <div className="col-auto">
                        <button type="button" className="btn btn-outline-secondary">Search</button>
                    </div>
                </div>
            </form>

            <div className="departments-table">
                <div className="department-card card shadow-sm">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
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
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : departments.length > 0 ? (
                                    departments.map(department => (
                                        <tr key={department.id}>
                                            <td className="department-code">{department.code}</td>
                                            <td className="department-name">{department.name}</td>
                                            <td>{department.location || '—'}</td>
                                            <td>
                                                <span className={`status-badge status-${department.status?.toLowerCase()}`}>
                                                    {department.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button 
                                                        onClick={() => handleEdit(department)}
                                                        className="btn btn-outline-primary btn-sm"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleArchive(department.id)}
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
                                        <td colSpan="5" className="empty-state">
                                            <div className="empty-icon">🏢</div>
                                            <div className="empty-message">No departments found</div>
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

export default DepartmentsIndex;
