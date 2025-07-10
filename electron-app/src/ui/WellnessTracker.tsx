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
  type ChartData,
  type ScriptableContext,
  
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const res = await fetch("http://localhost:8000/mood");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json() as MoodEntry[];
        setMoodData(data);
      } catch (error: unknown) {
        setError('Failed to fetch mood data. Please try again later.');
        console.error("Failed to fetch mood data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMoodData();
  }, []);

  const chartData: ChartData<'line'> = {
    labels: moodData.map(entry =>
      new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map(entry => mapMoodToChartValue(entry.mood)),
        borderColor: '#a78bfa',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(167, 139, 250, 0.3)');
          gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#a78bfa',
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#a78bfa',
        pointHoverBorderColor: '#fff',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    layout: {
      padding: {
        top: 30,
        bottom: 30,
        left: 10,
        right: 10,
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
      },
    },
    scales: {
      y: {
        min: -0.1,
        max: 2.2,
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
        max: 10,
        offset: false,
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
        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading mood data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : moodData.length > 0 ? (
          <Line options={options} data={chartData} />
        ) : (
          <p>No mood data available.</p>
        )}
      </div>
    </div>
  );
};

export default WellnessTracker;