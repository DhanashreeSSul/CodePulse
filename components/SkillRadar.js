'use client';

import { Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function SkillRadar({ skillDistribution }) {
    if (!skillDistribution || Object.keys(skillDistribution).length === 0) {
        return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>Sync profiles to see skill distribution</div>;
    }

    const sorted = Object.entries(skillDistribution).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const labels = sorted.map(([key]) => key);
    const values = sorted.map(([, val]) => val);
    const maxVal = Math.max(...values) || 1;

    const data = {
        labels,
        datasets: [{
            label: 'Skill Level',
            data: values.map(v => Math.round((v / maxVal) * 100)),
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.6)',
            borderWidth: 2,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#000',
            pointHoverBackgroundColor: '#000',
            pointHoverBorderColor: '#fff',
        }],
    };

    const options = {
        responsive: true,
        scales: {
            r: {
                angleLines: { color: 'rgba(255,255,255,0.08)' },
                grid: { color: 'rgba(255,255,255,0.08)' },
                pointLabels: { color: '#a0a0a0', font: { size: 11 } },
                ticks: { display: false },
                suggestedMin: 0, suggestedMax: 100,
            },
        },
        plugins: { legend: { display: false } },
    };

    return <Radar data={data} options={options} />;
}
