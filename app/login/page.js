'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, GraduationCap, BookOpen, LogIn, Code2, AlertCircle } from 'lucide-react';

const ROLES = [
    { id: 'student', label: 'Student', icon: BookOpen, desc: 'Track your coding progress' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, desc: 'Monitor & mentor students' },
    { id: 'admin', label: 'Admin', icon: Shield, desc: 'Full platform oversight' },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            const dest = result.role === 'admin' ? '/admin' : result.role === 'teacher' ? '/teacher' : '/dashboard';
            router.push(dest);
        } else {
            setError(result.error || 'Login failed');
        }
        setLoading(false);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '460px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Code2 size={22} color="var(--accent)" />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Welcome back</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Sign in to CodePulse</p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {/* Role Tabs */}
                    <div className="role-tabs">
                        {ROLES.map(r => {
                            const Icon = r.icon;
                            return (
                                <button key={r.id} className={`role-tab${role === r.id ? ' active' : ''}`} onClick={() => setRole(r.id)} type="button">
                                    <Icon size={14} /> {r.label}
                                </button>
                            );
                        })}
                    </div>

                    {error && (
                        <div className="message-error">
                            <AlertCircle size={15} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="input-label">Email address</label>
                            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">Password</label>
                            <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                            <LogIn size={16} /> {loading ? 'Signing in...' : `Sign in as ${role}`}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No account?{' '}
                        <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 500 }}>Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
