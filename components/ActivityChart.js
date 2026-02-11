'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function ActivityChart({ activities }) {
    if (!activities || activities.length === 0) {
        return <div style={{ color: '#666', padding: '2rem', textAlign: 'center' }}>No activity data to display</div>;
    }

    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
    }).reverse();

    const activityCounts = last7Days.map(date =>
        activities.filter(a => new Date(a.timestamp).toLocaleDateString() === date).length
    );

    const data = {
        labels: last7Days,
        datasets: [{
            label: 'Contributions',
            data: activityCounts,
            borderColor: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            tension: 0.4,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#000',
            fill: true,
        }],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top', labels: { color: '#a0a0a0' } },
            title: { display: false },
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0a0' } },
            x: { grid: { display: false }, ticks: { color: '#a0a0a0' } },
        },
    };

    return <Line options={options} data={data} />;
}
