import './WellnessTracker.css';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MoodEntry {
  mood: number;
  timestamp: string;
}

// Helper to map mood values for the chart
const mapMoodToChartValue = (mood: number) => {
  switch (mood) {
    case 0: // Happy
      return 2;
    case 1: // Sad
      return 0;
    case 2: // Neutral
      return 1;
    default:
      return 1;
  }
};

const WellnessTracker: React.FC = () => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const res = await fetch("http://localhost:8000/mood");
        const data = await res.json();
        setMoodData(data);
      } catch (error) {
        console.error("Failed to fetch mood data:", error);
      }
    };
    fetchMoodData();
  }, []);

  const chartData = {
    labels: moodData.map(entry =>
      new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map(entry => mapMoodToChartValue(entry.mood)),
        borderColor: '#8e44ad',
        backgroundColor: 'rgba(142, 68, 173, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#8e44ad',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#8e44ad',
        pointHoverBorderColor: '#fff',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 10,
        right: 20,
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
            family: "'Inter', sans-serif",
            size: 14,
            weight: 'bold',
        },
        bodyFont: {
            family: "'Inter', sans-serif",
            size: 12,
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
            label: function(context: TooltipItem<'line'>) {
                const value = context.parsed.y;
                let moodLabel = '';
                if (value === 2) moodLabel = '😊 Happy';
                if (value === 1) moodLabel = '😐 Neutral';
                if (value === 0) moodLabel = '😔 Sad';
                return `Mood: ${moodLabel}`;
            }
        }
      }
    },
    scales: {
      y: {
        min: -0.5,
        max: 2.5,
        ticks: {
          callback: function(value: string | number) {
            const numValue = Number(value);
            if (numValue === 2) return 'Happy';
            if (numValue === 1) return 'Neutral';
            if (numValue === 0) return 'Sad';
            return '';
          },
          color: '#b0b0d0',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#b0b0d0',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="wellness-tracker-container">
      <div className="wellness-tracker-header">
        <h2>Wellness Tracker</h2>
        <p>Visualize your mood trends and reflect on your emotional journey.</p>
      </div>
      <div className="wellness-graph-container">
        {moodData.length > 0 ? (
          <Line options={options} data={chartData} />
        ) : (
          <p>Loading mood data...</p>
        )}
      </div>
    </div>
  );
};

export default WellnessTracker;