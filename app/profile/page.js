'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { User, Save, RefreshCw, CheckCircle2, AlertCircle, Github, Code2, Flame, BookOpen, Star, Globe } from 'lucide-react';

const PLATFORMS = [
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'e.g. torvalds', color: 'var(--purple)' },
    { key: 'leetcode', label: 'LeetCode', icon: Code2, placeholder: 'e.g. neal_wu', color: 'var(--yellow)' },
    { key: 'codeforces', label: 'Codeforces', icon: Flame, placeholder: 'e.g. tourist', color: 'var(--blue)' },
    { key: 'gfg', label: 'GeeksForGeeks', icon: BookOpen, placeholder: 'e.g. johndoe', color: 'var(--accent)' },
    { key: 'codechef', label: 'CodeChef', icon: Star, placeholder: 'e.g. admin', color: 'var(--orange)' },
    { key: 'hackerrank', label: 'HackerRank', icon: Globe, placeholder: 'e.g. johnDoe', color: 'var(--text-secondary)' },
];

export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();
    const [profiles, setProfiles] = useState({ github: '', leetcode: '', codeforces: '', gfg: '', codechef: '', hackerrank: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return; }
        if (user?.profiles) setProfiles({ ...profiles, ...user.profiles });
    }, [user, authLoading]);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profiles }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: 'Profile saved! Head to dashboard to sync.' });
                refreshUser();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to save' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Network error' });
        }
        setSaving(false);
    }

    if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!user) return null;

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <p className="heading-mono"><User size={11} /> Profile Settings</p>
                <h1 className="heading-lg">Coding Profiles</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Add your usernames so we can fetch your stats from each platform.</p>
            </div>

            {message && (
                <div className={message.type === 'success' ? 'message-success' : 'message-error'}>
                    {message.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave}>
                <div className="card">
                    {PLATFORMS.map(({ key, label, icon: Icon, placeholder, color }) => (
                        <div key={key} className="form-group">
                            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Icon size={13} color={color} /> {label} username
                            </label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder={placeholder}
                                value={profiles[key] || ''}
                                onChange={e => setProfiles(prev => ({ ...prev, [key]: e.target.value }))}
                            />
                        </div>
                    ))}

                    <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem' }}>
                        <Save size={15} /> {saving ? 'Saving...' : 'Save Profiles'}
                    </button>
                </div>
            </form>

            <div className="card" style={{ background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                    <RefreshCw size={14} color="var(--accent)" style={{ marginTop: '3px', flexShrink: 0 }} />
                    <div>
                        <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem' }}>After saving</p>
                        <p style={{ color: 'var(--accent)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                            Go to your <a href="/dashboard" style={{ textDecoration: 'underline', fontWeight: 600 }}>Dashboard</a> and click "Sync" to fetch fresh data from all platforms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
