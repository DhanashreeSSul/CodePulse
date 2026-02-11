'use client';

import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(''); setLoading(true);
        const result = await login(email, password);
        if (result.success) { router.push('/dashboard'); }
        else { setError(result.error || 'Login failed'); }
        setLoading(false);
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
            <div className="card" style={{ maxWidth: '440px', width: '100%' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem', color: '#fff' }}>Welcome Back</h1>
                <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '2rem' }}>Sign in to your CodePulse account</p>

                {error && <div className="message-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0', fontSize: '0.9rem' }}>Email</label>
                        <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#a0a0a0', fontSize: '0.9rem' }}>Password</label>
                        <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#a0a0a0' }}>
                    Don&apos;t have an account? <Link href="/register" style={{ color: '#fff', fontWeight: 500 }}>Create one</Link>
                </p>
            </div>
        </div>
    );
}
