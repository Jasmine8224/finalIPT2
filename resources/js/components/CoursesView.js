import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const CoursesView = () => {
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        q: '',
        department_id: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/admin/courses', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            setCourses(data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/admin/departments', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            setDepartments(data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = !filters.q || 
            course.code?.toLowerCase().includes(filters.q.toLowerCase()) ||
            course.title?.toLowerCase().includes(filters.q.toLowerCase());
        
        const matchesDepartment = !filters.department_id || 
            course.department_id?.toString() === filters.department_id;
        
        return matchesSearch && matchesDepartment;
    });

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="mb-0">Courses Overview</h4>
                <a href="/admin/settings?tab=courses" className="btn btn-primary">
                    <i className="fas fa-cog me-2"></i>Manage Courses
                </a>
            </div>

            {/* Filters removed per request */}

            {/* Courses Table */}
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">
                        Courses ({filteredCourses.length})
                    </h5>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="text-center py-4">
                            <div className="mb-3">
                                <i className="fas fa-book fa-3x text-muted"></i>
                            </div>
                            <h5 className="text-muted">No courses found</h5>
                            <p className="text-muted">
                                {filters.q || filters.department_id ? 
                                    'Try adjusting your search criteria.' : 
                                    'No courses have been added yet.'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Title</th>
                                        <th>Units</th>
                                        <th>Department</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourses.map(course => (
                                        <tr key={course.id}>
                                            <td>
                                                <strong>{course.code}</strong>
                                            </td>
                                            <td>{course.title}</td>
                                            <td>
                                                <span className="badge bg-info">
                                                    {course.units} {course.units === 1 ? 'unit' : 'units'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    {course.department?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${course.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                    {course.status || 'active'}
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

export default CoursesView;
