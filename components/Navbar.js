'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <Link href="/" className="logo">CodePulse</Link>
            <div className="nav-links">
                {user ? (
                    <>
                        <Link href="/dashboard">Dashboard</Link>
                        <Link href="/profile">Profile</Link>
                        <span style={{ color: '#fff', fontWeight: 500 }}>Hi, {user.name}</span>
                        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link href="/login">Login</Link>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                            Get Started
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
