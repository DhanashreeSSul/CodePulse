'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    Shield, Users, GraduationCap, BookOpen, Trophy, Code2,
    Github, TrendingUp, RefreshCw, ChevronRight, Activity,
    BarChart3, Award, Layers, Search
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="card" style={{ borderTop: `2px solid ${color}` }}>
            <div className="stat-label"><Icon size={13} /> {label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
        </div>
    );
}

function RoleBadge({ role }) {
    const map = {
        admin: { label: 'Admin', cls: 'badge-admin', Icon: Shield },
        teacher: { label: 'Teacher', cls: 'badge-teacher', Icon: GraduationCap },
        student: { label: 'Student', cls: 'badge-student', Icon: BookOpen },
    };
    const { label, cls, Icon } = map[role] || map.student;
    return <span className={`nav-user-badge ${cls}`}><Icon size={11} /> {label}</span>;
}

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!authLoading) {
            if (!user) { router.push('/login'); return; }
            if (user.role !== 'admin') { router.push('/dashboard'); return; }
            fetchUsers();
        }
    }, [user, authLoading]);

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    if (authLoading || loading) return (
        <div className="loading-screen">
            <div className="spinner" />
            <span style={{ fontSize: '0.85rem' }}>Loading admin panel...</span>
        </div>
    );

    const admins = users.filter(u => u.role === 'admin');
    const teachers = users.filter(u => u.role === 'teacher');
    const students = users.filter(u => u.role === 'student');
    const totalSolved = students.reduce((acc, u) => {
        const lc = u.platformStats?.leetcode?.totalSolved || 0;
        const cf = u.platformStats?.codeforces?.problemsSolved || 0;
        const gfg = u.platformStats?.gfg?.totalSolved || 0;
        return acc + lc + cf + gfg;
    }, 0);

    const filtered = users.filter(u => {
        const matchRole = filter === 'all' || u.role === filter;
        const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    return (
        <div>
            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <p className="heading-mono"><Shield size={11} /> Admin Panel</p>
                    <h1 className="heading-lg">Platform Overview</h1>
                </div>
                <button className="btn btn-outline btn-sm" onClick={fetchUsers}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <StatCard icon={Users} label="Total Users" value={users.length} color="var(--text-primary)" />
                <StatCard icon={Shield} label="Admins" value={admins.length} color="var(--orange)" />
                <StatCard icon={GraduationCap} label="Teachers" value={teachers.length} color="var(--blue)" />
                <StatCard icon={BookOpen} label="Students" value={students.length} color="var(--accent)" />
                <StatCard icon={Trophy} label="Problems Solved" value={totalSolved} color="var(--yellow)" />
            </div>

            {/* Platform breakdown */}
            <div className="grid-2">
                <div className="card">
                    <h3 className="section-title"><BarChart3 size={16} color="var(--accent)" /> Student Platform Activity</h3>
                    {['leetcode', 'codeforces', 'gfg', 'github'].map(p => {
                        const total = students.reduce((a, u) => {
                            if (p === 'github') return a + (u.platformStats?.github?.totalRepos || 0);
                            if (p === 'codeforces') return a + (u.platformStats?.codeforces?.problemsSolved || 0);
                            return a + (u.platformStats?.[p]?.totalSolved || 0);
                        }, 0);
                        const labels = { leetcode: 'LeetCode Solved', codeforces: 'Codeforces Solved', gfg: 'GFG Solved', github: 'GitHub Repos' };
                        return (
                            <div key={p} style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{labels[p]}</span>
                                    <span className="code-text" style={{ fontSize: '0.82rem' }}>{total}</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, total / 2)}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="card">
                    <h3 className="section-title"><Activity size={16} color="var(--blue)" /> Recent Registrations</h3>
                    {[...users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6).map(u => (
                        <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                            <div>
                                <span style={{ color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 500 }}>{u.name}</span>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.email}</div>
                            </div>
                            <RoleBadge role={u.role} />
                        </div>
                    ))}
                </div>
            </div>

            {/* All users table */}
            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <h3 className="section-title" style={{ margin: 0 }}><Users size={16} color="var(--accent)" /> All Users</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {['all', 'admin', 'teacher', 'student'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} style={{ textTransform: 'capitalize', minWidth: '70px', justifyContent: 'center' }}>
                                {f}
                            </button>
                        ))}
                        <div style={{ position: 'relative' }}>
                            <Search size={13} style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="input-field" style={{ paddingLeft: '2rem', height: '32px', fontSize: '0.82rem', width: '180px' }} placeholder="Search name / email" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>GitHub</th>
                                <th>LeetCode</th>
                                <th>CF Rating</th>
                                <th>GFG Solved</th>
                                <th>Remarks</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{u.name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.email}</div>
                                    </td>
                                    <td><RoleBadge role={u.role} /></td>
                                    <td><span className="code-text">{u.profiles?.github || <span style={{ color: 'var(--text-muted)' }}>—</span>}</span></td>
                                    <td><span className="code-text">{u.platformStats?.leetcode?.totalSolved || 0}</span></td>
                                    <td><span className="code-text">{u.platformStats?.codeforces?.rating || 0}</span></td>
                                    <td><span className="code-text">{u.platformStats?.gfg?.totalSolved || 0}</span></td>
                                    <td><span className="code-text">{u.remarks?.length || 0}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
