'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';
import { LayoutDashboard, User, LogOut, Code2, Shield, GraduationCap, BookOpen } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();

    const roleIcon = user?.role === 'admin' ? <Shield size={13} /> : user?.role === 'teacher' ? <GraduationCap size={13} /> : <BookOpen size={13} />;
    const badgeClass = user?.role === 'admin' ? 'badge-admin' : user?.role === 'teacher' ? 'badge-teacher' : 'badge-student';

    const dashLink = user?.role === 'admin' ? '/admin' : user?.role === 'teacher' ? '/teacher' : '/dashboard';

    return (
        <nav className="navbar">
            <Link href="/" className="logo">
                <Code2 size={18} />
                <span className="logo-bracket">{'<'}</span>CodePulse<span className="logo-bracket">{'/>'}</span>
            </Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <Link href={dashLink}><LayoutDashboard size={15} /><span>Dashboard</span></Link>
                        {user.role === 'student' && <Link href="/profile"><User size={15} /><span>Profile</span></Link>}
                        <span className={`nav-user-badge ${badgeClass}`}>{roleIcon} {user.role}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{user.name}</span>
                        <button onClick={logout} className="btn btn-outline btn-sm" style={{ marginLeft: '0.25rem' }}>
                            <LogOut size={14} />
                            <span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login"><span>Login</span></Link>
                        <Link href="/register" className="btn btn-primary btn-sm">
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
