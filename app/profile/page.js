'use client';

import { useState, useEffect, useCallback } from 'react';
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

const emptyProfiles = { github: '', leetcode: '', codeforces: '', codechef: '', hackerrank: '', gfg: '' };

export default function ProfilePage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
    const router = useRouter();

    const [profiles, setProfiles] = useState(emptyProfiles);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [message, setMessage] = useState('');
    const [loaded, setLoaded] = useState(false);

    // Load saved profiles from user object whenever user data is available
    const loadProfiles = useCallback(() => {
        if (user?.profiles) {
            setProfiles(prev => ({
                ...prev,
                github: user.profiles.github || '',
                leetcode: user.profiles.leetcode || '',
                codeforces: user.profiles.codeforces || '',
                codechef: user.profiles.codechef || '',
                hackerrank: user.profiles.hackerrank || '',
                gfg: user.profiles.gfg || '',
            }));
            setLoaded(true);
        }
    }, [user]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }
        if (user && !loaded) {
            loadProfiles();
        }
    }, [user, authLoading, router, loaded, loadProfiles]);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profiles }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ Profiles saved successfully! Your links are now stored.');
                // Refresh user data so profiles are available across the app
                await refreshUser();
            } else {
                setMessage('❌ ' + (data.error || 'Save failed'));
            }
        } catch {
            setMessage('❌ Failed to save profiles');
        }
        setSaving(false);
    }

    async function handleSync() {
        setSyncing(true);
        setMessage('');
        try {
            // First save any changes
            await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profiles }),
            });

            // Then sync data from all platforms
            const res = await fetch('/api/profile', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setMessage('✅ All platforms synced! Go to Dashboard to see your insights.');
                sessionStorage.setItem('platformData', JSON.stringify(data.platformData));
                sessionStorage.setItem('skillAnalysis', JSON.stringify(data.skillAnalysis));
                // Refresh user data
                await refreshUser();
            } else {
                setMessage('❌ ' + (data.error || 'Sync failed'));
            }
        } catch (err) {
            setMessage('❌ Sync failed: ' + err.message);
        }
        setSyncing(false);
    }

    if (authLoading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a0a0a0' }}>Loading...</div>;
    if (!user) return null;

    // Count how many profiles are saved
    const savedCount = Object.values(profiles).filter(v => v && v.trim() !== '').length;

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h1 className="heading-lg">Connect Your Profiles</h1>
            <p style={{ color: '#a0a0a0', marginBottom: '0.5rem', fontSize: '1.05rem' }}>
                Paste your profile URLs below. They&apos;ll be saved to your account automatically.
            </p>
            <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
                {savedCount > 0 ? `✅ ${savedCount} profile${savedCount > 1 ? 's' : ''} linked` : 'No profiles linked yet'}
            </p>

            {message && <div className={message.includes('✅') ? 'message-success' : 'message-error'}>{message}</div>}

            <form onSubmit={handleSave}>
                {platformConfig.map((platform) => (
                    <div key={platform.key} className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>{platform.icon}</span>
                                {platform.label}
                            </span>
                            {profiles[platform.key] && profiles[platform.key].trim() !== '' && (
                                <span style={{ fontSize: '0.75rem', color: '#4ade80', background: 'rgba(74,222,128,0.1)', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                                    Linked
                                </span>
                            )}
                        </label>
                        <input className="input-field" type="text" placeholder={platform.placeholder}
                            value={profiles[platform.key] || ''}
                            onChange={(e) => setProfiles({ ...profiles, [platform.key]: e.target.value })} />
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
