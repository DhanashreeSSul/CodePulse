'use client';

import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Code2, Github, Trophy, Zap, BarChart3, Users, ChevronRight, Shield, GraduationCap, BookOpen, Star } from 'lucide-react';

export default function HomePage() {
    const { user } = useAuth();

    const dashLink = !user ? '/login' : user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/dashboard';

    const features = [
        { icon: BarChart3, title: 'Unified Analytics', desc: 'Aggregate data from LeetCode, Codeforces, GFG, and GitHub into one dashboard.', color: 'var(--accent)' },
        { icon: Zap, title: 'AI-Powered Insights', desc: 'Get personalized recommendations, skill gaps, and company match scores.', color: 'var(--yellow)' },
        { icon: Users, title: 'Role-Based Access', desc: 'Students track progress. Teachers give remarks. Admins see everything.', color: 'var(--blue)' },
        { icon: Trophy, title: 'DSA Topic Analysis', desc: 'Understand exactly which algorithms and data structures to focus on next.', color: 'var(--purple)' },
    ];

    const roles = [
        { icon: Shield, label: 'Admin', desc: 'Full platform visibility — all users, all stats, all activity.', color: 'var(--orange)', cls: 'badge-admin' },
        { icon: GraduationCap, label: 'Teacher', desc: 'View student profiles, track progress, post remarks and feedback.', color: 'var(--blue)', cls: 'badge-teacher' },
        { icon: BookOpen, label: 'Student', desc: 'Sync coding profiles, view analytics, read teacher feedback.', color: 'var(--accent)', cls: 'badge-student' },
    ];

    return (
        <div>
            {/* Hero */}
            <div style={{ textAlign: 'center', padding: '4rem 1rem 3rem', maxWidth: '640px', margin: '0 auto' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.85rem', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)', borderRadius: '99px', marginBottom: '1.5rem', fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    <Star size={11} /> Developer Analytics Platform
                </div>
                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                    Track every line.<br />
                    <span style={{ color: 'var(--accent)' }}>Own every problem.</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                    CodePulse unifies your GitHub, LeetCode, Codeforces, and GFG data into a single analytics dashboard — with AI insights, teacher remarks, and company match scores.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href={dashLink} className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                        <Zap size={16} /> {user ? 'Go to Dashboard' : 'Get Started'}
                    </Link>
                    {!user && (
                        <Link href="/login" className="btn btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
                            <ChevronRight size={16} /> Sign In
                        </Link>
                    )}
                </div>
            </div>

            {/* Roles */}
            <div className="card" style={{ background: 'rgba(255,255,255,0.02)', marginBottom: '2rem' }}>
                <h2 style={{ textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '1.25rem' }}>Three roles. One platform.</h2>
                <div className="grid-3">
                    {roles.map(({ icon: Icon, label, desc, color, cls }) => (
                        <div key={label} style={{ textAlign: 'center', padding: '1.25rem' }}>
                            <div style={{ width: '44px', height: '44px', background: `rgba(0,0,0,0.3)`, border: `1px solid ${color}33`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                                <Icon size={20} color={color} />
                            </div>
                            <span className={`nav-user-badge ${cls}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{label}</span>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginTop: '0.5rem' }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                {features.map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="card" style={{ borderLeft: `2px solid ${color}` }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '36px', height: '36px', background: `${color}15`, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={17} color={color} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{title}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CTA */}
            {!user && (
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--accent-dim)', border: '1px solid var(--border-accent)' }}>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>Ready to level up?</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Join as a student, teacher, or admin. Free to use.</p>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/register" className="btn btn-primary" style={{ padding: '0.7rem 1.5rem' }}><Code2 size={15} /> Register now</Link>
                        <Link href="/login" className="btn btn-outline" style={{ padding: '0.7rem 1.5rem' }}>Sign In</Link>
                    </div>
                </div>
            )}
        </div>
    );
}
