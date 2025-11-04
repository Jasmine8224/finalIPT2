import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const DepartmentsView = () => {
    const [departments, setDepartments] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filters, setFilters] = useState({
        q: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [departmentsResponse, coursesResponse] = await Promise.all([
                fetch('/api/admin/departments', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                }),
                fetch('/api/admin/courses', {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                })
            ]);
            
            const departmentsData = await departmentsResponse.json();
            const coursesData = await coursesResponse.json();
            
            setDepartments(departmentsData.departments || []);
            setCourses(coursesData.courses || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCourseCountForDepartment = (departmentId) => {
        return courses.filter(course => course.department_id === departmentId).length;
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const filteredDepartments = departments.filter(department => {
        const matchesSearch = !filters.q || 
            department.code?.toLowerCase().includes(filters.q.toLowerCase()) ||
            department.name?.toLowerCase().includes(filters.q.toLowerCase()) ||
            department.location?.toLowerCase().includes(filters.q.toLowerCase());
        
        return matchesSearch;
    });

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Departments Overview</h4>
                <a href="/admin/settings?tab=departments" className="btn btn-primary">
                    <i className="fas fa-cog me-2"></i>Manage Departments
                </a>
            </div>

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-12">
                            <label className="form-label">Search Departments</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by code, name, or location..."
                                value={filters.q}
                                onChange={(e) => handleFilterChange('q', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Departments Table */}
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">
                        Departments ({filteredDepartments.length})
                    </h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredDepartments.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="mb-3">
                                <i className="fas fa-building fa-3x text-muted"></i>
                            </div>
                            <h5 className="text-muted">No departments found</h5>
                            <p className="text-muted">
                                {filters.q ? 
                                    'Try adjusting your search criteria.' : 
                                    'No departments have been added yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Department Code</th>
                                        <th>Department Name</th>
                                        <th>Location</th>
                                        <th>Status</th>
                                        <th>Courses</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDepartments.map(department => (
                                        <tr key={department.id}>
                                            <td>
                                                <strong>{department.code}</strong>
                                            </td>
                                            <td>{department.name}</td>
                                            <td>
                                                <span className="text-muted">
                                                    {department.location || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${department.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {department.status || 'active'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge bg-info">
                                                    {getCourseCountForDepartment(department.id)} courses
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default DepartmentsView;
