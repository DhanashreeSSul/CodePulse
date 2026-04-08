'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import ActivityChart from '@/components/ActivityChart';
import SkillRadar from '@/components/SkillRadar';
import {
    LayoutDashboard, RefreshCw, Trophy, Code2, Github, Star,
    TrendingUp, Target, Layers, MessageSquare, CheckCircle2,
    AlertTriangle, BookOpen, Zap, BarChart3, Award, Flame,
    ChevronRight, ExternalLink, GitFork
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub }) {
    return (
        <div className="card" style={{ borderTop: `2px solid ${color || 'var(--border-color)'}` }}>
            <div className="stat-label"><Icon size={13} color={color} /> {label}</div>
            <div className="stat-value">{value}</div>
            {sub && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{sub}</div>}
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [platformData, setPlatformData] = useState(null);
    const [skillAnalysis, setSkillAnalysis] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);
    const [remarks, setRemarks] = useState([]);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/login'); return; }
        if (!authLoading && user) {
            // non-students go to their own panel
            if (user.role === 'admin') { router.push('/admin'); return; }
            if (user.role === 'teacher') { router.push('/teacher'); return; }
            // load cached data
            const cached = sessionStorage.getItem('platformData');
            const cachedAnalysis = sessionStorage.getItem('skillAnalysis');
            if (cached && cachedAnalysis) {
                setPlatformData(JSON.parse(cached));
                setSkillAnalysis(JSON.parse(cachedAnalysis));
                setHasSynced(true);
            }
            // fetch remarks
            fetchRemarks();
        }
    }, [user, authLoading, router]);

    async function fetchRemarks() {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.user?.remarks) setRemarks(data.user.remarks);
        } catch (e) { console.error(e); }
    }

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

    if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>;
    if (!user) return null;

    const gh = platformData?.github;
    const lc = platformData?.leetcode;
    const cf = platformData?.codeforces;
    const gfg = platformData?.gfg;

    if (!hasSynced) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div style={{ textAlign: 'center', maxWidth: '480px', width: '100%' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <LayoutDashboard size={28} color="var(--accent)" />
                    </div>
                    <h1 className="heading-lg">Your Dashboard</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        Sync your coding profiles to generate unified analytics — problems solved, ratings, activity, and AI-powered recommendations.
                    </p>
                    <div className="card" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                        {['GitHub repos & activity', 'LeetCode easy/medium/hard stats', 'Codeforces rating & contests', 'GFG problems solved', 'AI skill analysis & recommendations'].map(item => (
                            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.4rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                                <CheckCircle2 size={13} color="var(--accent)" /> {item}
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" onClick={handleSync} disabled={syncing} style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}>
                        <Zap size={16} /> {syncing ? 'Fetching data...' : 'Sync & Generate Dashboard'}
                    </button>
                    <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        Add profile links on the <a href="/profile" style={{ color: 'var(--accent)' }}>Profile page</a> first
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <p className="heading-mono"><LayoutDashboard size={11} /> Student Dashboard</p>
                    <h1 className="heading-lg">Welcome back, {user.name.split(' ')[0]}</h1>
                </div>
                <button className="btn btn-outline btn-sm" onClick={handleSync} disabled={syncing}>
                    <RefreshCw size={14} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing...' : 'Refresh'}
                </button>
            </div>

            {/* Top stats */}
            <div className="stats-grid">
                <StatCard icon={Trophy} label="Total Solved" value={skillAnalysis?.totalProblemsSolved || 0} color="var(--accent)" sub="across all platforms" />
                <StatCard icon={Award} label="Overall Score" value={skillAnalysis?.overallScore || 0} color="var(--yellow)" />
                <StatCard icon={Github} label="GitHub Repos" value={gh?.stats?.totalRepos || 0} color="var(--purple)" />
                <StatCard icon={Code2} label="LeetCode" value={lc?.stats?.totalSolved || 0} color="var(--yellow)" />
                <StatCard icon={Flame} label="CF Rating" value={cf?.stats?.rating || 'N/A'} color="var(--blue)" />
            </div>

            {/* Platform breakdown */}
            {skillAnalysis?.platformBreakdown && Object.keys(skillAnalysis.platformBreakdown).length > 0 && (
                <div className="card card-accent">
                    <h3 className="section-title"><BarChart3 size={16} color="var(--accent)" /> Problems by Platform</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`, gap: '1rem' }}>
                        {Object.entries(skillAnalysis.platformBreakdown).map(([platform, count]) => (
                            <div key={platform} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{count}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{platform}</div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (count / skillAnalysis.totalProblemsSolved) * 100)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Teacher remarks */}
            {remarks.length > 0 && (
                <div className="card" style={{ borderLeft: '2px solid var(--blue)' }}>
                    <h3 className="section-title"><MessageSquare size={16} color="var(--blue)" /> Remarks from Teachers</h3>
                    {remarks.map((r, i) => (
                        <div key={i} className="remark-card">
                            <div className="remark-meta">
                                <span className="remark-teacher">{r.teacherName}</span>
                                <span className="remark-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="remark-text">{r.text}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts */}
            <div className="grid-2">
                <div className="card">
                    <h3 className="section-title"><TrendingUp size={16} color="var(--accent)" /> GitHub Activity (Last 7 Days)</h3>
                    <ActivityChart activities={gh?.events?.map(e => ({ timestamp: e.createdAt, type: e.type, repoName: e.repo, platform: 'GitHub' })) || []} />
                </div>
                <div className="card">
                    <h3 className="section-title"><Target size={16} color="var(--purple)" /> Skill Radar</h3>
                    <SkillRadar skillDistribution={skillAnalysis?.skillDistribution || {}} />
                </div>
            </div>

            {/* LeetCode breakdown */}
            {lc && (
                <div className="card">
                    <h3 className="section-title"><Code2 size={16} color="var(--yellow)" /> LeetCode Breakdown</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {[['Easy', lc.stats?.easySolved, 'var(--accent)'], ['Medium', lc.stats?.mediumSolved, 'var(--yellow)'], ['Hard', lc.stats?.hardSolved, 'var(--red)'], [`#${lc.stats?.ranking || 'N/A'}`, null, 'var(--text-muted)', 'Ranking']].map(([val, num, color, altLabel]) => (
                            <div key={val} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color, fontFamily: 'monospace' }}>{num !== null && num !== undefined ? num : val}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{altLabel || val}</div>
                            </div>
                        ))}
                    </div>
                    {lc.tags?.length > 0 && (
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top Tags</p>
                            {lc.tags.slice(0, 8).map((tag, i) => <span key={i} className="skill-tag">{tag.tagName} ({tag.problemsSolved})</span>)}
                        </div>
                    )}
                </div>
            )}

            {/* Codeforces */}
            {cf && (
                <div className="card">
                    <h3 className="section-title"><Flame size={16} color="var(--blue)" /> Codeforces Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        {[{ val: cf.stats?.rating || 0, label: 'Rating', c: 'var(--blue)' }, { val: cf.stats?.maxRating || 0, label: 'Max Rating', c: 'var(--text-secondary)' }, { val: cf.stats?.problemsSolved || 0, label: 'Solved', c: 'var(--accent)' }, { val: cf.stats?.contestsParticipated || 0, label: 'Contests', c: 'var(--yellow)' }].map(item => (
                            <div key={item.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: item.c, fontFamily: 'monospace' }}>{item.val}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Rank: <span style={{ color: 'var(--text-primary)', fontWeight: 600, textTransform: 'capitalize' }}>{cf.stats?.rank || 'Unrated'}</span>
                    </div>
                    {cf.tags?.length > 0 && (
                        <div style={{ marginTop: '0.75rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Strong Topics</p>
                            {cf.tags.slice(0, 8).map((tag, i) => <span key={i} className="skill-tag">{tag.tagName} ({tag.problemsSolved})</span>)}
                        </div>
                    )}
                </div>
            )}

            {/* GFG */}
            {gfg && (
                <div className="card">
                    <h3 className="section-title"><BookOpen size={16} color="var(--accent)" /> GeeksForGeeks</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                        {[{ v: gfg.stats?.totalSolved, l: 'Total', c: 'var(--text-primary)' }, { v: gfg.stats?.easySolved, l: 'Easy', c: 'var(--accent)' }, { v: gfg.stats?.mediumSolved, l: 'Medium', c: 'var(--yellow)' }, { v: gfg.stats?.hardSolved, l: 'Hard', c: 'var(--red)' }].map(({ v, l, c }) => (
                            <div key={l} style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: c, fontFamily: 'monospace' }}>{v || 0}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{l}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Coding Score: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{gfg.stats?.score > 0 ? gfg.stats.score : 'N/A'}</span>
                    </div>
                </div>
            )}

            {/* GitHub repos */}
            {gh?.repos?.length > 0 && (
                <div className="card">
                    <h3 className="section-title"><Github size={16} color="var(--purple)" /> Top GitHub Repositories</h3>
                    <div className="grid-2">
                        {gh.repos.slice(0, 6).map((repo, i) => (
                            <div key={i} className="repo-card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                        {repo.name} <ExternalLink size={11} />
                                    </a>
                                    <span style={{ color: 'var(--yellow)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Star size={11} /> {repo.stars}
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0.35rem 0 0.5rem', lineHeight: 1.5 }}>
                                    {repo.description ? repo.description.substring(0, 65) + (repo.description.length > 65 ? '...' : '') : 'No description'}
                                </p>
                                {repo.language && <span className="skill-tag" style={{ margin: 0, fontSize: '0.72rem' }}>{repo.language}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* DSA Analysis */}
            {skillAnalysis?.dsaSkills && Object.keys(skillAnalysis.dsaSkills).length > 0 && (
                <div className="card">
                    <h3 className="section-title"><Layers size={16} color="var(--orange)" /> DSA Topic Analysis</h3>
                    <div className="grid-2">
                        {Object.entries(skillAnalysis.dsaSkills).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([topic, count]) => (
                            <div key={topic} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', minWidth: '130px', textTransform: 'capitalize' }}>{topic}</span>
                                <div className="progress-bar-bg" style={{ flex: 1 }}>
                                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (count / Math.max(...Object.values(skillAnalysis.dsaSkills))) * 100)}%` }} />
                                </div>
                                <span className="code-text" style={{ fontSize: '0.8rem', minWidth: '28px', textAlign: 'right' }}>{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Company matches */}
            {skillAnalysis?.companyMatches?.length > 0 && (
                <div className="card" style={{ borderLeft: '2px solid var(--accent)' }}>
                    <h3 className="section-title"><Trophy size={16} color="var(--accent)" /> Companies You Should Apply To</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Based on your DSA strengths</p>
                    <div className="grid-2">
                        {skillAnalysis.companyMatches.map((company, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{company.company}</span>
                                    <span className="code-text" style={{ fontSize: '0.82rem' }}>{company.score}%</span>
                                </div>
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${company.score}%` }} />
                                </div>
                                <div style={{ marginTop: '0.5rem' }}>
                                    {company.matchedTopics.slice(0, 3).map((t, j) => <span key={j} className="skill-tag" style={{ fontSize: '0.7rem' }}>{t}</span>)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Strengths & weaknesses */}
            <div className="grid-2">
                <div className="card">
                    <h3 className="section-title"><CheckCircle2 size={16} color="var(--accent)" /> Strengths</h3>
                    {skillAnalysis?.strengths?.length > 0 ? (
                        skillAnalysis.strengths.map((s, i) => (
                            <div key={i} className="recommendation-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <ChevronRight size={14} color="var(--accent)" style={{ marginTop: '4px', flexShrink: 0 }} />{s}
                            </div>
                        ))
                    ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Sync profiles to see strengths.</p>}
                </div>
                <div className="card">
                    <h3 className="section-title"><AlertTriangle size={16} color="var(--yellow)" /> Areas to Improve</h3>
                    {skillAnalysis?.weaknesses?.length > 0 ? (
                        skillAnalysis.weaknesses.map((w, i) => (
                            <div key={i} className="recommendation-item" style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                <ChevronRight size={14} color="var(--yellow)" style={{ marginTop: '4px', flexShrink: 0 }} />{w}
                            </div>
                        ))
                    ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No major weaknesses detected!</p>}
                </div>
            </div>

            {/* DSA Improvements */}
            {skillAnalysis?.dsaImprovements?.length > 0 && (
                <div className="card">
                    <h3 className="section-title"><BookOpen size={16} color="var(--orange)" /> DSA Topics to Improve</h3>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                        {skillAnalysis.dsaImprovements.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem', background: 'rgba(255,255,255,0.02)', borderRadius: '7px', border: '1px solid var(--border-color)' }}>
                                <div>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginRight: '0.5rem', fontSize: '0.88rem' }}>{item.topic}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>— {item.reason}</span>
                                </div>
                                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '99px', background: item.priority === 'high' ? 'rgba(255,71,87,0.1)' : 'rgba(255,211,61,0.1)', color: item.priority === 'high' ? 'var(--red)' : 'var(--yellow)', border: `1px solid ${item.priority === 'high' ? 'rgba(255,71,87,0.25)' : 'rgba(255,211,61,0.25)'}` }}>
                                    {item.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Score breakdown */}
            <div className="card">
                <h3 className="section-title"><BarChart3 size={16} color="var(--blue)" /> Score Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem' }}>
                    {[
                        { label: 'Problem Solving', score: skillAnalysis?.problemSolvingScore || 0, color: 'var(--accent)' },
                        { label: 'Project Building', score: skillAnalysis?.projectBuildingScore || 0, color: 'var(--blue)' },
                        { label: 'Consistency', score: skillAnalysis?.consistencyScore || 0, color: 'var(--yellow)' },
                        { label: 'Collaboration', score: skillAnalysis?.collaborationScore || 0, color: 'var(--purple)' },
                    ].map(item => (
                        <div key={item.label} style={{ textAlign: 'center' }}>
                            <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto' }}>
                                <svg viewBox="0 0 36 36">
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={item.color} strokeWidth="3" strokeDasharray={`${item.score}, 100`} strokeLinecap="round" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
                                </svg>
                                <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '0.85rem', fontWeight: 700, color: item.color, fontFamily: 'monospace' }}>
                                    {item.score}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recommendations */}
            <div className="card" style={{ borderLeft: '2px solid var(--purple)' }}>
                <h3 className="section-title"><Zap size={16} color="var(--purple)" /> Personalized Recommendations</h3>
                {skillAnalysis?.recommendations?.length > 0 ? (
                    skillAnalysis.recommendations.map((r, i) => <div key={i} className="recommendation-item">{r}</div>)
                ) : <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Recommendations will appear after syncing.</p>}
            </div>
        </div>
    );
}
