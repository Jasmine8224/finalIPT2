import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';

const FacultiesIndex = () => {
    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filters, setFilters] = useState({
        q: '',
        department_filter: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFaculties();
        fetchDepartments();
    }, [filters]);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/faculties?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            
            console.log('Faculties API Response:', data); // Debug log
            
            if (data.error) {
                console.error('Faculties API Error:', data.error);
            }
            
            setFaculties(data.faculties || []);
        } catch (error) {
            console.error('Error fetching faculties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await fetch('/api/departments', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin'
            });
            const data = await response.json();
            setDepartments(data || []);
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

    const clearFilters = () => {
        setFilters({
            q: '',
            department_filter: ''
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    const handleArchive = async (facultyId) => {
        if (confirm('Archive this faculty member?')) {
            try {
                const response = await fetch(`/api/admin/faculties/${facultyId}/archive`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    credentials: 'same-origin'
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Faculty archived successfully!');
                    fetchFaculties(); // Refresh the list
                } else {
                    alert('Error: ' + (data.message || 'Something went wrong'));
                }
            } catch (error) {
                console.error('Error archiving faculty:', error);
                alert('Error archiving faculty. Please try again.');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h4 className="mb-0">Faculty</h4>
                    <div className="text-muted small">Handle management and supervision of faculty and academic staff..</div>
                </div>
                <div className="page-actions">
                    <a href="/admin/settings?tab=security" className="btn btn-sm btn-archive-green">Archive</a>
                    <a href="/admin/faculties/create" className="btn btn-sm btn-add-black">+ Add Faculty</a>
                </div>
            </div>

            {/* Filters removed per request */}

            <div className="faculties-table">
                <div className="faculty-card card shadow-sm">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Position</th>
                                    <th>Status</th>
                                    <th className="text-end">Actions</th>
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
                                ) : faculties.length > 0 ? (
                                    faculties.map(faculty => (
                                        <tr key={faculty.id}>
                                            <td className="faculty-name">
                                                {faculty.full_name}
                                                {faculty.suffix && <span className="text-muted"> {faculty.suffix}</span>}
                                            </td>
                                            <td>{faculty.email || '—'}</td>
                                            <td>{faculty.department?.name || '—'}</td>
                                            <td>{faculty.position || '—'}</td>
                                            <td>
                                                <span className={`status-badge status-${faculty.status?.toLowerCase()}`}>
                                                    {faculty.status}
                                                </span>
                                            </td>
                                            <td className="text-end action-buttons">
                                                <a href={`/admin/faculties/${faculty.id}/edit`} className="btn btn-sm btn-edit">
                                                    Edit
                                                </a>
                                                <button 
                                                    onClick={() => handleArchive(faculty.id)}
                                                    className="btn btn-sm btn-archive"
                                                >
                                                    Archive
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-state">
                                            <div className="empty-icon">🧑‍🏫</div>
                                            <div className="empty-message">No faculty found</div>
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

export default FacultiesIndex;
