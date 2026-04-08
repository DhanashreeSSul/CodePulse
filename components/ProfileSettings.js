'use client';

import { useState, useEffect } from 'react';
import styles from './ProfileSettings.module.css';

const USERNAME_REGEX = /^[a-zA-Z0-9_-]{1,50}$/;

function validate(value) {
    if (!value) return null; // optional fields
    return USERNAME_REGEX.test(value) ? null : 'Only letters, numbers, underscores and hyphens (max 50 chars)';
}

export default function ProfileSettings({ initialProfiles = {} }) {
    const [profiles, setProfiles] = useState({
        github: initialProfiles.github || '',
        leetcode: initialProfiles.leetcode || '',
        codeforces: initialProfiles.codeforces || '',
        codechef: initialProfiles.codechef || '',
        hackerrank: initialProfiles.hackerrank || '',
        gfg: initialProfiles.gfg || '',
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3500);
        return () => clearTimeout(t);
    }, [toast]);

    function handleChange(field, value) {
        setProfiles(p => ({ ...p, [field]: value }));
        const err = validate(value);
        setErrors(e => ({ ...e, [field]: err }));
    }

    async function handleSave(e) {
        e.preventDefault();
        // Validate all fields
        const newErrors = {};
        Object.entries(profiles).forEach(([k, v]) => {
            newErrors[k] = validate(v);
        });
        setErrors(newErrors);
        if (Object.values(newErrors).some(Boolean)) return;

        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    profiles,
                    githubUsername: profiles.github,
                    leetcodeUsername: profiles.leetcode,
                    codeforcesHandle: profiles.codeforces,
                    codechefUsername: profiles.codechef,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Save failed');
            setToast({ type: 'success', msg: '✅ Profiles saved successfully!' });
        } catch (err) {
            setToast({ type: 'error', msg: `❌ ${err.message}` });
        } finally {
            setSaving(false);
        }
    }

    const fields = [
        { key: 'github',     label: 'GitHub',      placeholder: 'octocat',        icon: '🐙' },
        { key: 'leetcode',   label: 'LeetCode',    placeholder: 'john_doe',       icon: '🧩' },
        { key: 'codeforces', label: 'Codeforces',  placeholder: 'tourist',        icon: '⚔️' },
        { key: 'codechef',   label: 'CodeChef',    placeholder: 'codechef_user',  icon: '👨‍🍳' },
        { key: 'hackerrank', label: 'HackerRank',  placeholder: 'hacker123',      icon: '🟢' },
        { key: 'gfg',        label: 'GeeksForGeeks', placeholder: 'geek_user',   icon: '🌿' },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>Platform Profiles</h2>
                <p className={styles.subtitle}>Link your coding profiles to sync stats automatically</p>
            </div>

            {toast && (
                <div className={`${styles.toast} ${styles[toast.type]}`}>
                    {toast.msg}
                </div>
            )}

            <form onSubmit={handleSave} className={styles.form} noValidate>
                <div className={styles.grid}>
                    {fields.map(({ key, label, placeholder, icon }) => (
                        <div key={key} className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor={`profile-${key}`}>
                                <span className={styles.icon}>{icon}</span>
                                {label}
                            </label>
                            <input
                                id={`profile-${key}`}
                                type="text"
                                className={`${styles.input} ${errors[key] ? styles.inputError : ''}`}
                                placeholder={placeholder}
                                value={profiles[key]}
                                onChange={e => handleChange(key, e.target.value)}
                                maxLength={50}
                                autoComplete="off"
                            />
                            {errors[key] && (
                                <p className={styles.errorMsg}>{errors[key]}</p>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    id="save-profiles-btn"
                    type="submit"
                    className={styles.saveBtn}
                    disabled={saving}
                >
                    {saving ? (
                        <><span className={styles.spinner} /> Saving…</>
                    ) : (
                        'Save Profiles'
                    )}
                </button>
            </form>
        </div>
    );
}
