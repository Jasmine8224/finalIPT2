import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const FacultyForm = ({ faculty = null, isEdit = false }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        suffix: '',
        sex: '',
        email: '',
        contact_number: '',
        address: '',
        department_id: '',
        position: '',
        status: 'active'
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchDepartments();
        if (faculty) {
            setFormData({
                full_name: faculty.full_name || '',
                suffix: faculty.suffix || '',
                sex: faculty.sex || '',
                email: faculty.email || '',
                contact_number: faculty.contact_number || '',
                address: faculty.address || '',
                department_id: faculty.department_id || '',
                position: faculty.position || '',
                status: faculty.status || 'active'
            });
        }
    }, [faculty]);

    const fetchDepartments = async () => {
        try {
            console.log('Fetching departments for faculty...');
            const response = await fetch('/api/admin/departments', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            console.log('Faculty departments response:', data);
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleChange = (e) => {
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
        setLoading(true);
        setErrors({});

        try {
            const url = isEdit ? `/api/admin/faculties/${faculty.id}` : '/api/admin/faculties';
            const method = isEdit ? 'PUT' : 'POST';
            
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
                alert(isEdit ? 'Faculty updated successfully!' : 'Faculty created successfully!');
                window.location.href = '/admin/faculties';
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                }
            }
        } catch (error) {
            console.error('Error saving faculty:', error);
            alert('Error saving faculty. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-start gap-2 page-title-wrap">
                    <div className="page-title-icon" aria-hidden="true">
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.909V17h2V9L12 3zm0 13L4.5 11.5 12 8l7.5 3.5L12 16zm-6 1.5V20c0 1.657 3.582 3 8 3s8-1.343 8-3v-2.5c-1.773 1.12-5.004 1.833-8 1.833s-6.227-.713-8-1.833z"/></svg>
                    </div>
                    <div>
                        <div className="page-title-text">{isEdit ? 'Edit Faculty' : 'Add New Faculty'}</div>
                        <div className="page-subtitle-text">Fill in the faculty member details below</div>
                    </div>
                </div>
                <a href="/admin/faculties" className="btn btn-back">← Back to Faculty</a>
            </div>

            <div className="form-container coral-form">
                <div className="form-card">
                    <div className="form-header">
                        <div className="form-title">{isEdit ? 'Edit Faculty Information' : 'Add New Faculty'}</div>
                        <div className="form-subtitle">Fill in the faculty member details below</div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid grid-2">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.full_name && <div className="invalid-feedback">{errors.full_name[0]}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Suffix</label>
                                <select
                                    name="suffix"
                                    className={`form-select ${errors.suffix ? 'is-invalid' : ''}`}
                                    value={formData.suffix}
                                    onChange={handleChange}
                                >
                                    <option value="">— Select Suffix —</option>
                                    <option value="Jr.">Jr.</option>
                                    <option value="Sr.">Sr.</option>
                                    <option value="II">II</option>
                                    <option value="III">III</option>
                                    <option value="IV">IV</option>
                                </select>
                                {errors.suffix && <div className="invalid-feedback">{errors.suffix[0]}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sex *</label>
                                <select
                                    name="sex"
                                    className={`form-select ${errors.sex ? 'is-invalid' : ''}`}
                                    value={formData.sex}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">— Select Sex —</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                                {errors.sex && <div className="invalid-feedback">{errors.sex[0]}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.email && <div className="invalid-feedback">{errors.email[0]}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Contact Number</label>
                                <input
                                    type="text"
                                    name="contact_number"
                                    className={`form-control ${errors.contact_number ? 'is-invalid' : ''}`}
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                />
                                {errors.contact_number && <div className="invalid-feedback">{errors.contact_number[0]}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department *</label>
                                <select
                                    name="department_id"
                                    className={`form-select ${errors.department_id ? 'is-invalid' : ''}`}
                                    value={formData.department_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">— Select Department —</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                                {errors.department_id && <div className="invalid-feedback">{errors.department_id[0]}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Position</label>
                                <select
                                    name="position"
                                    className="form-select"
                                    value={formData.position}
                                    onChange={handleChange}
                                >
                                    <option value="">— Select Position —</option>
                                    <option value="Professor">Professor</option>
                                    <option value="Instructor">Instructor</option>
                                    <option value="Department Head">Department Head</option>
                                    <option value="Dean">Dean</option>
                                </select>
                            </div>


                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select
                                    name="status"
                                    className="form-select"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="retired">Retired</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    name="address"
                                    className="form-control"
                                    rows="3"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="btn btn-save"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : (isEdit ? 'Update Faculty' : 'Create Faculty')}
                            </button>
                            <a href="/admin/faculties" className="btn btn-cancel">
                                Cancel
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default FacultyForm;
