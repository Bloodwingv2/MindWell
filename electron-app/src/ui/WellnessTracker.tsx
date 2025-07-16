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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMoodData = async () => {
    setIsLoading(true);
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

  const handleRefresh = async () => {
      setIsProcessing(true);
      setError(null);
      try {
          // First, process any buffered conversations to update the mood log
          await fetch("http://localhost:8000/process_conversations", { method: 'POST' });
          // Then, fetch the updated mood data
          await fetchMoodData();
      } catch (e) {
          setError("Failed to refresh data.");
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  }

  useEffect(() => {
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
        borderColor: '#8e44ad',
        backgroundColor: (context: ScriptableContext<'line'>) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(142, 68, 173, 0.3)');
          gradient.addColorStop(1, 'rgba(142, 68, 173, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#8e44ad',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#8e44ad',
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
      padding: 20
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
        backgroundColor: '#20203a',
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
          color: '#c0c0c0',
          font: {
            family: "'Inter', sans-serif",
            size: 12,
          },
        },
        grid: {
          color: '#33334d',
        },
      },
      x: {
        ticks: {
          color: '#c0c0c0',
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
        <button className="refresh-button" onClick={handleRefresh} disabled={isProcessing}>
            {isProcessing ? (
                <><div className="spinner-small"></div> Processing...</>
            ) : (
                'Refresh Graph'
            )}
        </button>
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
