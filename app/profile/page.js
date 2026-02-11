'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

const platformConfig = [
    { key: 'github', label: 'GitHub', placeholder: 'https://github.com/yourusername', icon: '🐙' },
    { key: 'leetcode', label: 'LeetCode', placeholder: 'https://leetcode.com/u/yourusername', icon: '🟡' },
    { key: 'codeforces', label: 'Codeforces', placeholder: 'https://codeforces.com/profile/yourusername', icon: '🔵' },
    { key: 'gfg', label: 'GeeksForGeeks', placeholder: 'https://www.geeksforgeeks.org/user/yourusername', icon: '🟢' },
    { key: 'codechef', label: 'CodeChef', placeholder: 'https://www.codechef.com/users/yourusername', icon: '👨‍🍳' },
    { key: 'hackerrank', label: 'HackerRank', placeholder: 'https://www.hackerrank.com/profile/yourusername', icon: '💚' },
];

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [profiles, setProfiles] = useState({
        github: '', leetcode: '', codeforces: '', codechef: '', hackerrank: '', gfg: '',
    });
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!authLoading && !user) router.push('/login');
        if (user?.profiles) setProfiles({ ...profiles, ...user.profiles });
    }, [user, authLoading, router]);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profiles }) });
            const data = await res.json();
            setMessage(data.success ? '✅ Profiles saved successfully!' : '❌ ' + (data.error || 'Save failed'));
        } catch { setMessage('❌ Failed to save profiles'); }
        setSaving(false);
    }

    async function handleSync() {
        setSyncing(true);
        setMessage('');
        try {
            await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profiles }) });
            const res = await fetch('/api/profile', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ All platforms synced! Go to Dashboard to see your insights.');
                sessionStorage.setItem('platformData', JSON.stringify(data.platformData));
                sessionStorage.setItem('skillAnalysis', JSON.stringify(data.skillAnalysis));
            } else {
                setMessage('❌ ' + (data.error || 'Sync failed'));
            }
        } catch (err) { setMessage('❌ Sync failed: ' + err.message); }
        setSyncing(false);
    }

    if (authLoading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a0a0a0' }}>Loading...</div>;
    if (!user) return null;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h1 className="heading-lg">Connect Your Profiles</h1>
            <p style={{ color: '#a0a0a0', marginBottom: '2rem', fontSize: '1.05rem' }}>
                Paste your profile URLs below. We&apos;ll fetch and analyze your data automatically.
            </p>

            {message && <div className={message.includes('✅') ? 'message-success' : 'message-error'}>{message}</div>}

            <form onSubmit={handleSave}>
                {platformConfig.map((platform) => (
                    <div key={platform.key} className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{platform.icon}</span>
                            {platform.label}
                        </label>
                        <input className="input-field" type="text" placeholder={platform.placeholder}
                            value={profiles[platform.key] || ''} onChange={(e) => setProfiles({ ...profiles, [platform.key]: e.target.value })} />
                    </div>
                ))}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1, padding: '0.85rem' }}>
                        {saving ? 'Saving...' : 'Save Profiles'}
                    </button>
                    <button className="btn btn-outline" type="button" disabled={syncing} onClick={handleSync}
                        style={{ flex: 1, padding: '0.85rem', fontWeight: 600 }}>
                        {syncing ? '🔄 Syncing all platforms...' : '🚀 Sync & Analyze All'}
                    </button>
                </div>
            </form>
        </div>
    );
}
