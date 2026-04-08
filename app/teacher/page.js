'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import {
    GraduationCap, Users, MessageSquarePlus, Trash2,
    RefreshCw, ChevronDown, ChevronUp, Trophy, Code2,
    BookOpen, Github, Activity, Send, AlertCircle, CheckCircle2, Search
} from 'lucide-react';

function PlatformStat({ label, value, color }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        </div>
    );
}

export default function TeacherDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const [remarkText, setRemarkText] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({});
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user) { router.push('/login'); return; }
            if (user.role !== 'teacher') { router.push('/dashboard'); return; }
            fetchStudents();
        }
    }, [user, authLoading]);

    async function fetchStudents() {
        setLoading(true);
        try {
            const res = await fetch('/api/teacher/students');
            const data = await res.json();
            if (data.success) setStudents(data.students);
        } catch (e) { console.error(e); }
        setLoading(false);
    }

    async function addRemark(studentId) {
        const text = remarkText[studentId]?.trim();
        if (!text) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/teacher/remark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, text }),
            });
            const data = await res.json();
            if (data.success) {
                setStudents(prev => prev.map(s => s._id === studentId
                    ? { ...s, remarks: [...(s.remarks || []), data.remark] }
                    : s
                ));
                setRemarkText(prev => ({ ...prev, [studentId]: '' }));
                setFeedback(prev => ({ ...prev, [studentId]: 'success' }));
                setTimeout(() => setFeedback(prev => ({ ...prev, [studentId]: null })), 2500);
            }
        } catch (e) { console.error(e); }
        setSubmitting(false);
    }

    async function deleteRemark(studentId, remarkId) {
        try {
            const res = await fetch('/api/teacher/remark', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, remarkId }),
            });
            const data = await res.json();
            if (data.success) {
                setStudents(prev => prev.map(s => s._id === studentId
                    ? { ...s, remarks: s.remarks.filter(r => r._id !== remarkId) }
                    : s
                ));
            }
        } catch (e) { console.error(e); }
    }

    if (authLoading || loading) return (
        <div className="loading-screen">
            <div className="spinner" />
            <span style={{ fontSize: '0.85rem' }}>Loading teacher panel...</span>
        </div>
    );

    const totalRemarks = students.reduce((a, s) => a + (s.remarks?.length || 0), 0);
    const synced = students.filter(s => s.lastSyncedAt).length;

    const filtered = students.filter(s =>
        !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <p className="heading-mono"><GraduationCap size={11} /> Teacher Panel</p>
                    <h1 className="heading-lg">My Students</h1>
                </div>
                <button className="btn btn-outline btn-sm" onClick={fetchStudents}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Stats row */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                {[
                    { icon: Users, label: 'Total Students', value: students.length, color: 'var(--accent)' },
                    { icon: Activity, label: 'Synced Profiles', value: synced, color: 'var(--blue)' },
                    { icon: MessageSquarePlus, label: 'Remarks Given', value: totalRemarks, color: 'var(--yellow)' },
                    { icon: Trophy, label: 'Avg LC Solved', value: students.length ? Math.round(students.reduce((a, s) => a + (s.platformStats?.leetcode?.totalSolved || 0), 0) / students.length) : 0, color: 'var(--orange)' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="card" style={{ borderTop: `2px solid ${color}` }}>
                        <div className="stat-label"><Icon size={13} /> {label}</div>
                        <div className="stat-value" style={{ color }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
                <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input-field" style={{ paddingLeft: '2.25rem' }} placeholder="Search students by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Student list */}
            {filtered.length === 0 && (
                <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                    <Users size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <p>No students found</p>
                </div>
            )}

            {filtered.map(student => {
                const isOpen = expanded === student._id;
                const lc = student.platformStats?.leetcode;
                const cf = student.platformStats?.codeforces;
                const gfg = student.platformStats?.gfg;
                const gh = student.platformStats?.github;

                return (
                    <div key={student._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        {/* Student header row */}
                        <div
                            onClick={() => setExpanded(isOpen ? null : student._id)}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', borderBottom: isOpen ? '1px solid var(--border-color)' : 'none' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(0,255,135,0.1)', border: '1px solid var(--border-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <BookOpen size={16} color="var(--accent)" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{student.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{student.email}</div>
                                </div>
                                {/* Quick stats */}
                                <div style={{ display: 'flex', gap: '1.25rem', marginLeft: '0.5rem', flexWrap: 'wrap' }}>
                                    <PlatformStat label="LC" value={lc?.totalSolved || 0} color="var(--yellow)" />
                                    <PlatformStat label="CF" value={cf?.rating || 0} color="var(--blue)" />
                                    <PlatformStat label="GFG" value={gfg?.totalSolved || 0} color="var(--accent)" />
                                    <PlatformStat label="Repos" value={gh?.totalRepos || 0} color="var(--purple)" />
                                </div>
                                {student.remarks?.length > 0 && (
                                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', background: 'rgba(250,211,61,0.12)', border: '1px solid rgba(250,211,61,0.2)', borderRadius: '99px', color: 'var(--yellow)' }}>
                                        {student.remarks.length} remark{student.remarks.length !== 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginLeft: '1rem', flexShrink: 0 }}>
                                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        </div>

                        {/* Expanded section */}
                        {isOpen && (
                            <div style={{ padding: '1.25rem' }}>
                                {/* Profiles */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Coding Profiles</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {Object.entries(student.profiles || {}).filter(([, v]) => v).map(([k, v]) => (
                                            <span key={k} className="skill-tag" style={{ color: 'var(--accent)' }}>
                                                <Code2 size={11} style={{ marginRight: '0.25rem' }} />{k}: {v}
                                            </span>
                                        ))}
                                        {!Object.values(student.profiles || {}).some(Boolean) && (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No profiles linked yet</span>
                                        )}
                                    </div>
                                </div>

                                {/* Detailed stats */}
                                <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                        <p style={{ color: 'var(--yellow)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase' }}>LeetCode</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                            {[['Easy', lc?.easySolved, 'var(--accent)'], ['Medium', lc?.mediumSolved, 'var(--yellow)'], ['Hard', lc?.hardSolved, 'var(--red)'], ['Rank', lc?.ranking ? `#${lc.ranking}` : '—', 'var(--text-muted)']].map(([l, v, c]) => (
                                                <div key={l}><div style={{ color: c, fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace' }}>{v || 0}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{l}</div></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                        <p style={{ color: 'var(--blue)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase' }}>Codeforces</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                            {[['Rating', cf?.rating, 'var(--blue)'], ['Max', cf?.maxRating, 'var(--text-secondary)'], ['Solved', cf?.problemsSolved, 'var(--accent)'], ['Contests', cf?.contestsParticipated, 'var(--text-muted)']].map(([l, v, c]) => (
                                                <div key={l}><div style={{ color: c, fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace' }}>{v || 0}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{l}</div></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.85rem' }}>
                                        <p style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.6rem', textTransform: 'uppercase' }}>GFG / GitHub</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                                            {[['GFG Total', gfg?.totalSolved, 'var(--accent)'], ['GFG Score', gfg?.score, 'var(--yellow)'], ['GH Repos', gh?.totalRepos, 'var(--purple)'], ['Commits', gh?.totalCommits, 'var(--text-muted)']].map(([l, v, c]) => (
                                                <div key={l}><div style={{ color: c, fontWeight: 600, fontSize: '0.95rem', fontFamily: 'monospace' }}>{v || 0}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{l}</div></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Existing remarks */}
                                {student.remarks?.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Remarks ({student.remarks.length})</p>
                                        {student.remarks.map(r => (
                                            <div key={r._id} className="remark-card">
                                                <div className="remark-meta">
                                                    <span className="remark-teacher">{r.teacherName}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span className="remark-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                                                        {r.teacherId === user?.id || r.teacherName === user?.name ? (
                                                            <button className="btn btn-danger btn-sm" style={{ padding: '0.15rem 0.4rem' }} onClick={() => deleteRemark(student._id, r._id)}>
                                                                <Trash2 size={12} />
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <div className="remark-text">{r.text}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Add remark */}
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>Add Remark</p>
                                    {feedback[student._id] === 'success' && (
                                        <div className="message-success" style={{ marginBottom: '0.6rem' }}>
                                            <CheckCircle2 size={14} /> Remark added successfully
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <textarea
                                            className="input-field"
                                            rows={2}
                                            placeholder="Write feedback, observations, or suggestions..."
                                            value={remarkText[student._id] || ''}
                                            onChange={e => setRemarkText(prev => ({ ...prev, [student._id]: e.target.value }))}
                                            style={{ resize: 'vertical', flex: 1 }}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            style={{ alignSelf: 'flex-end' }}
                                            disabled={submitting || !remarkText[student._id]?.trim()}
                                            onClick={() => addRemark(student._id)}
                                        >
                                            <Send size={14} /> Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
