'use client';

import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import styles from './ActivityChart.module.css';

function formatDate(date) {
    return date.toISOString().slice(0, 10);
}

function buildHeatmapValues(activities) {
    const countMap = {};
    activities.forEach((activity) => {
        const day = formatDate(new Date(activity.timestamp || activity.createdAt));
        countMap[day] = (countMap[day] || 0) + 1;
    });
    return Object.entries(countMap).map(([date, count]) => ({ date, count }));
}

function classForValue(value) {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count <= 2) return 'color-low';
    if (value.count <= 5) return 'color-mid';
    return 'color-high';
}

export default function ActivityChart() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/activities', { credentials: 'include' });
                if (!res.ok) {
                    setActivities([]);
                    return;
                }
                const data = await res.json();
                setActivities(data.activities || []);
            } catch {
                setActivities([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className={styles.skeleton}>
                {[...Array(8)].map((_, i) => <div key={i} className={styles.skeletonRow} />)}
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>📭</span>
                <p>No activity yet. Sync your profiles to get started.</p>
            </div>
        );
    }

    const values = buildHeatmapValues(activities);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 364);
    const totalActivity = activities.length;

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <span className={styles.total}>{totalActivity} contributions in the last year</span>
            </div>

            <div className={styles.heatmapWrap}>
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={endDate}
                    values={values}
                    classForValue={classForValue}
                    showWeekdayLabels
                    titleForValue={(value) => {
                        if (!value) return 'No contributions';
                        return `${value.date}: ${value.count} contribution${value.count === 1 ? '' : 's'}`;
                    }}
                />
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <span className={styles.legendLabel}>Less</span>
                {['empty', 'low', 'mid', 'high'].map((level) => (
                    <div key={level} className={`${styles.legendCell} ${styles[`${level}Level`]}`} />
                ))}
                <span className={styles.legendLabel}>More</span>
            </div>
        </div>
    );
}
