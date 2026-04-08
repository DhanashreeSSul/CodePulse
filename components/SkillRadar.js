'use client';

import { useState, useEffect } from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip,
} from 'recharts';
import styles from './SkillRadar.module.css';

const DEFAULT_SKILLS = [
    { subject: 'Arrays',    score: 0 },
    { subject: 'Strings',   score: 0 },
    { subject: 'Trees',     score: 0 },
    { subject: 'Graphs',    score: 0 },
    { subject: 'DP',        score: 0 },
    { subject: 'Recursion', score: 0 },
];

function deriveSkillsFromDSA(activities) {
    const topicCount = {};
    activities.forEach(a => {
        if (a.topic) {
            topicCount[a.topic] = (topicCount[a.topic] || 0) + 1;
        }
    });

    const total = Object.values(topicCount).reduce((s, n) => s + n, 0) || 1;
    const derived = Object.entries(topicCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([subject, count]) => ({ subject, score: Math.round((count / total) * 100) }));

    return derived.length > 0 ? derived : DEFAULT_SKILLS;
}

function CustomTooltip({ active, payload }) {
    if (!active || !payload?.length) return null;
    return (
        <div className={styles.tooltip}>
            <strong>{payload[0]?.payload?.subject}</strong>
            <span>: {payload[0]?.value}</span>
        </div>
    );
}

export default function SkillRadar({ skills: skillsProp, skillDistribution }) {
    const [dsaActivities, setDsaActivities] = useState([]);
    const hasSkillDistribution = skillDistribution && Object.keys(skillDistribution).length > 0;
    const [loading, setLoading] = useState(!skillsProp && !hasSkillDistribution);

    useEffect(() => {
        if (skillsProp || hasSkillDistribution) return; // use prop if provided
        async function load() {
            try {
                const res = await fetch('/api/dsa', { credentials: 'include' });
                if (!res.ok) return;
                const data = await res.json();
                setDsaActivities(data.activities || []);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [skillsProp, hasSkillDistribution]);

    const distributionData = hasSkillDistribution
        ? Object.entries(skillDistribution)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([subject, score]) => ({ subject, score: Math.min(100, Number(score) || 0) }))
        : [];

    const data = skillsProp
        ? skillsProp.map(s => ({ subject: s.subject, score: s.score }))
        : hasSkillDistribution
            ? distributionData
            : deriveSkillsFromDSA(dsaActivities);

    const hasData = data.some(d => d.score > 0);

    if (loading) {
        return (
            <div className={styles.skeleton}>
                <div className={styles.skeletonCircle} />
            </div>
        );
    }

    if (!hasData) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>📡</span>
                <p>Log some DSA problems to see your skill distribution here.</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid
                        stroke="rgba(255,255,255,0.07)"
                        gridType="polygon"
                    />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#909090', fontSize: 11, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Skill"
                        dataKey="score"
                        stroke="rgba(139, 92, 246, 0.8)"
                        fill="rgba(139, 92, 246, 0.2)"
                        fillOpacity={0.7}
                        dot={{ fill: '#a78bfa', r: 3 }}
                        activeDot={{ fill: '#c4b5fd', r: 5 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>

            {/* Legend pills */}
            <div className={styles.pills}>
                {data.filter(d => d.score > 0).slice(0, 6).map(({ subject, score }) => (
                    <div key={subject} className={styles.pill}>
                        <span className={styles.pillDot} />
                        <span>{subject}</span>
                        <span className={styles.pillScore}>{score}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
