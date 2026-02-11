'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import ActivityChart from '@/components/ActivityChart';
import SkillRadar from '@/components/SkillRadar';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [platformData, setPlatformData] = useState(null);
    const [skillAnalysis, setSkillAnalysis] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return; }
        const cached = sessionStorage.getItem('platformData');
        const cachedAnalysis = sessionStorage.getItem('skillAnalysis');
        if (cached && cachedAnalysis) {
            setPlatformData(JSON.parse(cached));
            setSkillAnalysis(JSON.parse(cachedAnalysis));
            setHasSynced(true);
        }
    }, [user, authLoading, router]);

    async function handleSync() {
        setSyncing(true);
        try {
            const res = await fetch('/api/profile', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                setPlatformData(data.platformData);
                setSkillAnalysis(data.skillAnalysis);
                setHasSynced(true);
                sessionStorage.setItem('platformData', JSON.stringify(data.platformData));
                sessionStorage.setItem('skillAnalysis', JSON.stringify(data.skillAnalysis));
            }
        } catch (err) { console.error('Sync failed', err); }
        setSyncing(false);
    }

    if (authLoading) return <div style={{ textAlign: 'center', marginTop: '4rem', color: '#a0a0a0' }}>Loading...</div>;
    if (!user) return null;

    const gh = platformData?.github;
    const lc = platformData?.leetcode;
    const cf = platformData?.codeforces;
    const gfg = platformData?.gfg;

    if (!hasSynced) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h1 className="heading-lg">Your Dashboard</h1>
                <div className="card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
                    <p style={{ color: '#a0a0a0', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                        Sync your coding profiles to see your unified analytics dashboard.
                    </p>
                    <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
                        {syncing ? '🔄 Fetching data...' : '🚀 Sync & Generate Dashboard'}
                    </button>
                    <p style={{ marginTop: '1rem', color: '#666', fontSize: '0.85rem' }}>
                        Add your profile links on the <a href="/profile" style={{ color: '#fff', textDecoration: 'underline' }}>Profile page</a> first.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="heading-lg" style={{ marginBottom: 0 }}>Unified Dashboard</h1>
                <button className="btn btn-outline" onClick={handleSync} disabled={syncing} style={{ fontSize: '0.85rem' }}>
                    {syncing ? '🔄 Syncing...' : '↻ Refresh'}
                </button>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
                <div className="card" style={{ borderTop: '3px solid #fff' }}>
                    <div className="stat-label">🧮 Total Solved</div>
                    <div className="stat-value">{skillAnalysis?.totalProblemsSolved || 0}</div>
                </div>
                <div className="card">
                    <div className="stat-label">🏆 Overall Score</div>
                    <div className="stat-value">{skillAnalysis?.overallScore || 0}</div>
                </div>
                <div className="card">
                    <div className="stat-label">🐙 GitHub Repos</div>
                    <div className="stat-value">{gh?.stats?.totalRepos || 0}</div>
                </div>
                <div className="card">
                    <div className="stat-label">🟡 LeetCode</div>
                    <div className="stat-value">{lc?.stats?.totalSolved || 0}</div>
                </div>
                <div className="card">
                    <div className="stat-label">🔵 CF Rating</div>
                    <div className="stat-value">{cf?.stats?.rating || 'N/A'}</div>
                </div>
            </div>

            {/* ===== PLATFORM BREAKDOWN ===== */}
            {skillAnalysis?.platformBreakdown && Object.keys(skillAnalysis.platformBreakdown).length > 0 && (
                <div className="card">
                    <h3 className="section-title">🧮 Problems Solved Per Platform</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Object.keys(skillAnalysis.platformBreakdown).length}, 1fr)`, gap: '1rem' }}>
                        {Object.entries(skillAnalysis.platformBreakdown).map(([platform, count], i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{count}</div>
                                <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{platform}</div>
                                <div className="progress-bar-bg" style={{ marginTop: '0.5rem' }}>
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (count / skillAnalysis.totalProblemsSolved) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '1rem', color: '#a0a0a0', fontSize: '0.9rem' }}>
                        Total: <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>{skillAnalysis.totalProblemsSolved}</span> problems across {Object.keys(skillAnalysis.platformBreakdown).length} platforms
                    </div>
                </div>
            )}

            {/* ===== CHARTS ===== */}
            <div className="grid-2">
                <div className="card">
                    <h3 className="section-title">📈 GitHub Activity (Last 7 Days)</h3>
                    <ActivityChart activities={gh?.events?.map(e => ({ timestamp: e.createdAt, type: e.type, repoName: e.repo, platform: 'GitHub' })) || []} />
                </div>
                <div className="card">
                    <h3 className="section-title">🎯 Skill Radar</h3>
                    <SkillRadar skillDistribution={skillAnalysis?.skillDistribution || {}} />
                </div>
            </div>

            {/* ===== LEETCODE ===== */}
            {lc && (
                <div className="card">
                    <h3 className="section-title">🟡 LeetCode Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ade80' }}>{lc.stats?.easySolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Easy</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#facc15' }}>{lc.stats?.mediumSolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Medium</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f87171' }}>{lc.stats?.hardSolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Hard</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a0a0a0' }}>#{lc.stats?.ranking || 'N/A'}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Ranking</div>
                        </div>
                    </div>
                    {lc.tags?.length > 0 && (
                        <div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Top Problem Tags:</div>
                            {lc.tags.slice(0, 8).map((tag, i) => <span key={i} className="skill-tag">{tag.tagName} ({tag.problemsSolved})</span>)}
                        </div>
                    )}
                </div>
            )}

            {/* ===== CODEFORCES ===== */}
            {cf && (
                <div className="card">
                    <h3 className="section-title">🔵 Codeforces Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        {[
                            { val: cf.stats?.rating || 0, label: 'Rating' },
                            { val: cf.stats?.maxRating || 0, label: 'Max Rating' },
                            { val: cf.stats?.problemsSolved || 0, label: 'Solved' },
                            { val: cf.stats?.contestsParticipated || 0, label: 'Contests' },
                        ].map((item, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{item.val}</div>
                                <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', color: '#a0a0a0' }}>
                        Rank: <span style={{ color: '#fff', fontWeight: 600, textTransform: 'capitalize' }}>{cf.stats?.rank || 'Unrated'}</span>
                    </div>
                    {cf.tags?.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Strong Topics:</div>
                            {cf.tags.slice(0, 8).map((tag, i) => <span key={i} className="skill-tag">{tag.tagName} ({tag.problemsSolved})</span>)}
                        </div>
                    )}
                </div>
            )}

            {/* ===== GEEKSFORGEEKS ===== */}
            {gfg && (
                <div className="card">
                    <h3 className="section-title">🟢 GeeksForGeeks</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{gfg.stats?.totalSolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Total Solved</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4ade80' }}>{gfg.stats?.easySolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Easy</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#facc15' }}>{gfg.stats?.mediumSolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Medium</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f87171' }}>{gfg.stats?.hardSolved || 0}</div>
                            <div style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>Hard</div>
                        </div>
                    </div>
                    {gfg.stats?.score > 0 && (
                        <div style={{ marginTop: '0.75rem', textAlign: 'center', color: '#a0a0a0' }}>
                            Coding Score: <span style={{ color: '#fff', fontWeight: 600 }}>{gfg.stats.score}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ===== GITHUB REPOS ===== */}
            {gh?.repos?.length > 0 && (
                <div className="card">
                    <h3 className="section-title">🐙 Top GitHub Repositories</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {gh.repos.slice(0, 6).map((repo, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1rem' }}>
                                <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{repo.name}</a>
                                <p style={{ color: '#666', fontSize: '0.8rem', margin: '0.25rem 0', lineHeight: 1.4 }}>
                                    {repo.description ? repo.description.substring(0, 60) + '...' : 'No description'}
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                                    {repo.language && <span className="skill-tag" style={{ margin: 0, fontSize: '0.75rem' }}>{repo.language}</span>}
                                    <span style={{ color: '#a0a0a0' }}>⭐ {repo.stars}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== DSA SKILL ANALYSIS ===== */}
            {skillAnalysis?.dsaSkills && Object.keys(skillAnalysis.dsaSkills).length > 0 && (
                <div className="card">
                    <h3 className="section-title">🧩 DSA Topic Analysis</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {Object.entries(skillAnalysis.dsaSkills)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 12)
                            .map(([topic, count], i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ color: '#d4d4d4', fontSize: '0.9rem', minWidth: '140px', textTransform: 'capitalize' }}>{topic}</span>
                                    <div className="progress-bar-bg" style={{ flex: 1 }}>
                                        <div className="progress-bar-fill" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(skillAnalysis.dsaSkills))) * 100)}%` }}></div>
                                    </div>
                                    <span style={{ color: '#a0a0a0', fontSize: '0.8rem', minWidth: '30px', textAlign: 'right' }}>{count}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* ===== COMPANY RECOMMENDATIONS ===== */}
            {skillAnalysis?.companyMatches?.length > 0 && (
                <div className="card" style={{ borderLeft: '3px solid #fff' }}>
                    <h3 className="section-title">🏢 Companies You Should Apply To</h3>
                    <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '1rem' }}>Based on your DSA strengths, you are well-suited for:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {skillAnalysis.companyMatches.map((company, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>{company.company}</span>
                                    <span style={{ color: '#a0a0a0', fontSize: '0.85rem', fontWeight: 500 }}>{company.score}% match</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${company.score}%` }}></div>
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    {company.matchedTopics.slice(0, 3).map((t, j) => (
                                        <span key={j} className="skill-tag" style={{ fontSize: '0.7rem' }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== STRENGTHS & WEAKNESSES ===== */}
            <div className="grid-2">
                <div className="card">
                    <h3 className="section-title">✅ Strengths</h3>
                    {skillAnalysis?.strengths?.length > 0 ? (
                        <ul style={{ paddingLeft: '1.25rem', color: '#d4d4d4', lineHeight: 2 }}>
                            {skillAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    ) : <p style={{ color: '#666' }}>Sync profiles to see strengths.</p>}
                </div>
                <div className="card">
                    <h3 className="section-title">⚠️ Areas to Improve</h3>
                    {skillAnalysis?.weaknesses?.length > 0 ? (
                        <ul style={{ paddingLeft: '1.25rem', color: '#d4d4d4', lineHeight: 2 }}>
                            {skillAnalysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    ) : <p style={{ color: '#666' }}>No major weaknesses detected!</p>}
                </div>
            </div>

            {/* ===== DSA IMPROVEMENT PLAN ===== */}
            {skillAnalysis?.dsaImprovements?.length > 0 && (
                <div className="card">
                    <h3 className="section-title">📚 DSA Topics to Improve</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {skillAnalysis.dsaImprovements.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <div>
                                    <span style={{ color: '#fff', fontWeight: 600, marginRight: '0.5rem' }}>{item.topic}</span>
                                    <span style={{ color: '#a0a0a0', fontSize: '0.85rem' }}>— {item.reason}</span>
                                </div>
                                <span style={{
                                    fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '99px',
                                    background: item.priority === 'high' ? 'rgba(248,113,113,0.15)' : 'rgba(250,204,21,0.15)',
                                    color: item.priority === 'high' ? '#f87171' : '#facc15',
                                    border: `1px solid ${item.priority === 'high' ? 'rgba(248,113,113,0.3)' : 'rgba(250,204,21,0.3)'}`,
                                }}>
                                    {item.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ===== RECOMMENDATIONS ===== */}
            <div className="card" style={{ borderLeft: '3px solid #a0a0a0' }}>
                <h3 className="section-title">🧠 Personalized Recommendations</h3>
                {skillAnalysis?.recommendations?.length > 0 ? (
                    <div>
                        {skillAnalysis.recommendations.map((r, i) => <div key={i} className="recommendation-item">{r}</div>)}
                    </div>
                ) : <p style={{ color: '#666' }}>Recommendations will appear after syncing.</p>}
            </div>

            {/* ===== SCORE BREAKDOWN ===== */}
            <div className="card">
                <h3 className="section-title">📊 Score Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {[
                        { label: 'Problem Solving', score: skillAnalysis?.problemSolvingScore || 0 },
                        { label: 'Project Building', score: skillAnalysis?.projectBuildingScore || 0 },
                        { label: 'Consistency', score: skillAnalysis?.consistencyScore || 0 },
                        { label: 'Collaboration', score: skillAnalysis?.collaborationScore || 0 },
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto' }}>
                                <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                        fill="none" stroke="#ffffff" strokeWidth="3" strokeDasharray={`${item.score}, 100`} strokeLinecap="round" />
                                </svg>
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                                    {item.score}
                                </span>
                            </div>
                            <p style={{ color: '#a0a0a0', fontSize: '0.8rem', marginTop: '0.5rem' }}>{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
