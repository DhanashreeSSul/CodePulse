'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, GraduationCap, BookOpen, UserPlus, Code2, AlertCircle, CheckCircle2 } from 'lucide-react';

const ROLES = [
    { id: 'student', label: 'Student', icon: BookOpen, desc: 'Track coding progress across platforms' },
    { id: 'teacher', label: 'Teacher', icon: GraduationCap, desc: 'Monitor students & give feedback' },
    { id: 'admin', label: 'Admin', icon: Shield, desc: 'Manage the entire platform' },
];

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        if (password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        const result = await register(name, email, password, role);
        if (result.success) {
            const dest = result.role === 'admin' ? '/admin' : result.role === 'teacher' ? '/teacher' : '/profile';
            router.push(dest);
        } else {
            setError(result.error || 'Registration failed');
        }
        setLoading(false);
    }

    const selectedRole = ROLES.find(r => r.id === role);
    const RoleIcon = selectedRole?.icon;

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '1rem' }}>
            <div style={{ width: '100%', maxWidth: '460px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Code2 size={22} color="var(--accent)" />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Create account</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Join CodePulse today</p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    {/* Role selector */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <p className="input-label" style={{ marginBottom: '0.6rem' }}>I am a...</p>
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
                        {selectedRole && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--accent)' }}>
                                <CheckCircle2 size={13} /> {selectedRole.desc}
                            </div>
                        )}
                    </div>

                    {error && <div className="message-error"><AlertCircle size={15} /> {error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="input-label">Full name</label>
                            <input className="input-field" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Email address</label>
                            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label className="input-label">Password <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>(min. 6 characters)</span></label>
                            <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}>
                            <UserPlus size={16} /> {loading ? 'Creating account...' : `Register as ${role}`}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
