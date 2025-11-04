import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';

const Dashboard = ({ stats }) => {
    const user = (typeof window !== 'undefined' && window.adminUser) ? window.adminUser : null;
    const initialStats = (typeof window !== 'undefined' && window.adminStats) ? window.adminStats : stats;
    const [liveStats, setLiveStats] = useState(initialStats || {});
    const [activity, setActivity] = useState({ today: { students_added: 0, faculties_added: 0, departments_added: 0, courses_added: 0 }, ts: null });

    // Derived values
    const activeUsers = (liveStats?.students ?? initialStats?.students ?? 0) + (liveStats?.faculties ?? initialStats?.faculties ?? 0);

    // Fetch today's activity and refresh periodically
    useEffect(() => {
        let isMounted = true;

        const fetchActivity = async () => {
            try {
                const res = await fetch('/api/admin/dashboard-activity', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin'
                });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) setActivity(data);
            } catch (e) {
                // silent fail
            }
        };

        const fetchStats = async () => {
            try {
                const res = await fetch('/api/admin/dashboard-stats', {
                    headers: { 'Accept': 'application/json' },
                    credentials: 'same-origin'
                });
                if (!res.ok) return;
                const data = await res.json();
                if (isMounted) setLiveStats(data);
            } catch (e) {
                // silent fail
            }
        };

        fetchActivity();
        fetchStats();
        const id = setInterval(() => { fetchActivity(); fetchStats(); }, 10000);
        return () => { isMounted = false; clearInterval(id); };
    }, []);

    return (
        <AdminLayout>
            <div className="dash-wrap">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h1 className="mb-1">Hello, Jasmine!</h1>
                        <div className="text-muted">Welcome Back!</div>
                    </div>
                </div>

                {/* Figma-style pill stats row */}
                <div className="row g-4 mt-2 mb-4">
                    {/* Total Students */}
                    <div className="col-12 col-md-3">
                        <div
                            style={{
                                background: '#f3d4d9',
                                borderRadius: 9999,
                                padding: '18px 22px',
                                boxShadow: '0 10px 20px rgba(0,0,0,.08)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {/* Graduation cap icon */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 3L1 8l11 5 9-4.091V17h2V8L12 3z" fill="#1b1b1b"/><path d="M7 12v4c0 1.657 2.686 3 6 3s6-1.343 6-3v-4l-6 2.727L7 12z" fill="#1b1b1b" opacity=".12"/></svg>
                                <div style={{ fontWeight: 600 }}>Total Students</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginLeft: 32 }}>
                                {liveStats?.students ?? initialStats?.students ?? 0}
                            </div>
                        </div>
                    </div>

                    {/* Total Faculties */}
                    <div className="col-12 col-md-3">
                        <div
                            style={{
                                background: '#f3d4d9',
                                borderRadius: 9999,
                                padding: '18px 22px',
                                boxShadow: '0 10px 20px rgba(0,0,0,.08)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {/* Faculty icon */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8z" fill="#1b1b1b"/><path d="M3 20c0-3.314 4.03-6 9-6s9 2.686 9 6v1H3v-1z" fill="#1b1b1b" opacity=".12"/></svg>
                                <div style={{ fontWeight: 600 }}>Total Faculties</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginLeft: 32 }}>
                                {liveStats?.faculties ?? initialStats?.faculties ?? 0}
                            </div>
                        </div>
                    </div>

                    {/* Buildings with tags */}
                    <div className="col-12 col-md-3">
                        <div
                            style={{
                                background: '#f3d4d9',
                                borderRadius: 9999,
                                padding: '18px 22px',
                                boxShadow: '0 10px 20px rgba(0,0,0,.08)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                {/* Building icon */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 21V5a2 2 0 012-2h7a2 2 0 012 2v16H3z" fill="#1b1b1b" opacity=".12"/><path d="M15 21V7a2 2 0 012-2h2a2 2 0 012 2v14h-6zM5 8h2v2H5V8zm0 4h2v2H5v-2zm0 4h2v2H5v-2zm4-8h2v2H9V8zm0 4h2v2H9v-2zm0 4h2v2H9v-2z" fill="#1b1b1b"/></svg>
                                <div style={{ fontWeight: 600 }}>Buildings</div>
                                <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                                    <span style={{ background: '#f2caa5', borderRadius: 9999, padding: '2px 8px', fontWeight: 600 }}>cbs</span>
                                    <span style={{ background: '#c8c2f2', borderRadius: 9999, padding: '2px 8px', fontWeight: 600 }}>cb</span>
                                    <span style={{ background: '#e0a7a2', borderRadius: 9999, padding: '2px 8px', fontWeight: 600 }}>cbe</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Courses */}
                    <div className="col-12 col-md-3">
                        <div
                            style={{
                                background: '#f3d4d9',
                                borderRadius: 9999,
                                padding: '18px 22px',
                                boxShadow: '0 10px 20px rgba(0,0,0,.08)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {/* Clipboard icon */}
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 3h6a2 2 0 012 2h1a2 2 0 012 2v13a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h1a2 2 0 012-2z" fill="#1b1b1b" opacity=".12"/><path d="M9 4a1 1 0 000 2h6a1 1 0 100-2H9zM7 9h10v2H7V9zm0 4h10v2H7v-2z" fill="#1b1b1b"/></svg>
                                <div style={{ fontWeight: 600 }}>Total Courses</div>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginLeft: 32 }}>
                                {liveStats?.courses ?? initialStats?.courses ?? 0}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activities & Notifications in coral panel */}
                <div className="coral-panel">
                    <div className="row g-3">
                        <div className="col-12 col-lg-6">
                            <div className="inner-card">
                                <div className="inner-header d-flex justify-content-between align-items-center">
                                    <div className="inner-title">Recent Activities</div>
                                    <div className="inner-trend">↗ +0.1%</div>
                                </div>
                                <ul className="activity-list">
                                    <li><span className="a-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span> Added <strong>{activity.today?.students_added ?? 0} Student{(activity.today?.students_added ?? 0) === 1 ? '' : 's'}</strong></li>
                                    <li><span className="a-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span> Added <strong>{activity.today?.faculties_added ?? 0} Faculty</strong></li>
                                    <li><span className="a-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span> Added <strong>{activity.today?.departments_added ?? 0} Department{(activity.today?.departments_added ?? 0) === 1 ? '' : 's'}</strong></li>
                                    <li><span className="a-icon" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span> Added <strong>{activity.today?.courses_added ?? 0} Course{(activity.today?.courses_added ?? 0) === 1 ? '' : 's'}</strong></li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-12 col-lg-6">
                            <div className="inner-card">
                                <div className="inner-header d-flex justify-content-between align-items-center">
                                    <div className="inner-title">Notifications</div>
                                </div>
                                <ul className="notif-list">
                                    <li><span className="n-icon">📣</span> Enrollment for 2nd Semester is now open!</li>
                                    <li><span className="n-icon">🗓️</span> Faculty meeting scheduled on October 25, 2025 at 2:00 PM.</li>
                                    <li><span className="n-icon">🖥️</span> System maintenance on October 28, 2025, from 10 PM to 12 AM.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
