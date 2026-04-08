'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './DSALogger.module.css';

const PLATFORMS = ['LeetCode', 'Codeforces', 'GeeksForGeeks', 'HackerRank', 'Offline', 'Other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const TOPICS = ['Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Recursion', 'Sorting', 'Hashing', 'Linked Lists', 'Stack & Queue', 'Binary Search', 'Greedy', 'Math', 'Other'];

const DIFFICULTY_COLORS = {
    easy: '#4ade80',
    medium: '#fb923c',
    hard: '#f87171',
    unknown: '#808080',
};

const INITIAL_FORM = {
    problemName: '',
    platform: 'LeetCode',
    difficulty: 'easy',
    topic: 'Arrays',
    notes: '',
};

export default function DSALogger() {
    const [form, setForm] = useState(INITIAL_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // { type: 'success'|'error', msg: string }
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProblems = useCallback(async () => {
        try {
            const res = await fetch('/api/dsa', { credentials: 'include' });
            if (!res.ok) return;
            const data = await res.json();
            setProblems(data.activities || []);
        } catch {
            // silently ignore
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProblems();
    }, [fetchProblems]);

    // Auto-dismiss status message
    useEffect(() => {
        if (!status) return;
        const t = setTimeout(() => setStatus(null), 4000);
        return () => clearTimeout(t);
    }, [status]);

    function handleChange(field, value) {
        setForm(f => ({ ...f, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.problemName.trim()) {
            setStatus({ type: 'error', msg: 'Problem name is required.' });
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/dsa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to log problem');

            setStatus({ type: 'success', msg: `✅ "${form.problemName}" logged successfully!` });
            setForm(INITIAL_FORM);
            fetchProblems();
        } catch (err) {
            setStatus({ type: 'error', msg: `❌ ${err.message}` });
        } finally {
            setSubmitting(false);
        }
    }

    const recentProblems = problems.slice(0, 10);

    return (
        <div className={styles.container}>
            {/* Form Section */}
            <div className={styles.formCard}>
                <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>📝 Log a DSA Problem</h2>
                    <p className={styles.cardSubtitle}>Manually track problems solved outside platform accounts</p>
                </div>

                {status && (
                    <div className={`${styles.alert} ${styles[status.type]}`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                    {/* Problem Name */}
                    <div className={styles.fieldFull}>
                        <label className={styles.label} htmlFor="dsa-problem-name">Problem Name *</label>
                        <input
                            id="dsa-problem-name"
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Two Sum, Longest Palindrome…"
                            value={form.problemName}
                            onChange={e => handleChange('problemName', e.target.value)}
                            required
                            maxLength={200}
                        />
                    </div>

                    <div className={styles.row}>
                        {/* Platform */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="dsa-platform">Platform</label>
                            <select
                                id="dsa-platform"
                                className={styles.select}
                                value={form.platform}
                                onChange={e => handleChange('platform', e.target.value)}
                            >
                                {PLATFORMS.map(p => (
                                    <option key={p} value={p.toLowerCase()}>{p}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="dsa-difficulty">Difficulty</label>
                            <select
                                id="dsa-difficulty"
                                className={styles.select}
                                value={form.difficulty}
                                onChange={e => handleChange('difficulty', e.target.value)}
                                style={{ color: DIFFICULTY_COLORS[form.difficulty] }}
                            >
                                {DIFFICULTIES.map(d => (
                                    <option key={d} value={d} style={{ color: DIFFICULTY_COLORS[d] }}>
                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Topic */}
                        <div className={styles.field}>
                            <label className={styles.label} htmlFor="dsa-topic">Topic</label>
                            <select
                                id="dsa-topic"
                                className={styles.select}
                                value={form.topic}
                                onChange={e => handleChange('topic', e.target.value)}
                            >
                                {TOPICS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className={styles.fieldFull}>
                        <label className={styles.label} htmlFor="dsa-notes">Notes (optional)</label>
                        <textarea
                            id="dsa-notes"
                            className={styles.textarea}
                            placeholder="Approach used, edge cases, time complexity…"
                            value={form.notes}
                            onChange={e => handleChange('notes', e.target.value)}
                            rows={3}
                            maxLength={1000}
                        />
                    </div>

                    <button
                        id="dsa-submit-btn"
                        type="submit"
                        className={styles.submitBtn}
                        disabled={submitting}
                    >
                        {submitting ? (
                            <><span className={styles.spinner} /> Logging…</>
                        ) : (
                            '+ Log Problem'
                        )}
                    </button>
                </form>
            </div>

            {/* Recent Problems Table */}
            <div className={styles.tableCard}>
                <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>🕒 Recent Problems</h3>
                    <span className={styles.badge}>{problems.length} total</span>
                </div>

                {loading ? (
                    <div className={styles.skeleton}>
                        {[...Array(4)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
                    </div>
                ) : recentProblems.length === 0 ? (
                    <div className={styles.emptyState}>
                        <span className={styles.emptyIcon}>🗂️</span>
                        <p>No problems logged yet. Start tracking your practice above!</p>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Problem</th>
                                    <th>Platform</th>
                                    <th>Difficulty</th>
                                    <th>Topic</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProblems.map(p => (
                                    <tr key={p._id} className={styles.tableRow}>
                                        <td className={styles.problemName}>
                                            {p.problemName}
                                            {p.notes && (
                                                <span className={styles.notesBadge} title={p.notes}>📌</span>
                                            )}
                                        </td>
                                        <td className={styles.platformCell}>{p.platform}</td>
                                        <td>
                                            <span
                                                className={styles.diffBadge}
                                                style={{ color: DIFFICULTY_COLORS[p.difficulty] || '#808080', borderColor: DIFFICULTY_COLORS[p.difficulty] || '#808080' }}
                                            >
                                                {p.difficulty}
                                            </span>
                                        </td>
                                        <td className={styles.topicCell}>{p.topic || '—'}</td>
                                        <td className={styles.dateCell}>
                                            {new Date(p.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
