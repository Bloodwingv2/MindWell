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
  Legend
} from 'chart.js';

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

interface WellnessTrackerProps {
  wellnessEntries: { date: string; score: number }[];
  setWellnessEntries: React.Dispatch<React.SetStateAction<{ date: string; score: number }[]>>;
}

interface MoodEntry {
  mood: number;
  timestamp: string;
}

const WellnessTracker: React.FC<WellnessTrackerProps> = ({ wellnessEntries, setWellnessEntries }) => {
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const res = await fetch("http://localhost:8000/mood");
        const data = await res.json();
        setMoodData(data); // assuming backend returns a list like [{ mood: 1, timestamp: "..." }]
      } catch (error) {
        console.error("Failed to fetch mood data:", error);
      }
    };
    fetchMoodData();
  }, []);

  const handleLogWellness = () => {
    const wellnessScoreInput = document.getElementById('wellnessScore') as HTMLInputElement;
    const score = parseInt(wellnessScoreInput.value);
    if (score >= 1 && score <= 10) {
      const newEntry = { date: new Date().toLocaleDateString(), score };
      setWellnessEntries(prev => [...prev, newEntry]);
      wellnessScoreInput.value = '';
      alert('Wellness logged!');
    } else {
      alert('Please enter a score between 1 and 10.');
    }
  };

  const chartData = {
    labels: moodData.map(entry =>
      new Date(entry.timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: 'Mood',
        data: moodData.map(entry => entry.mood),
        borderColor: 'rgb(142, 68, 173)',
        backgroundColor: 'rgba(142, 68, 173, 0.5)',
        tension: 0.3,
        pointRadius: 5
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Mood Trends Over Time',
        color: '#e0e0e0',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 2,
        ticks: {
          callback: function(value: string | number) {
            const numValue = Number(value);
            if (numValue === 0) return 'Happy';
            if (numValue === 1) return 'Sad';
            if (numValue === 2) return 'Neutral';
            return '';
          },
          color: '#e0e0e0',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#e0e0e0',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  return (
    <div className="wellness-tracker-content">
      <h2>Wellness Tracker</h2>
      <p>Log your daily wellness score (1-10) and see your progress over time.</p>
      <div className="wellness-input-container">
        <input type="number" id="wellnessScore" className="wellness-input-field" min="1" max="10" placeholder="Enter wellness score (1-10)" />
        <button id="logWellnessBtn" className="wellness-input-button" onClick={handleLogWellness}>Log Wellness</button>
      </div>
      <div className="wellness-graph-placeholder-styles">
        <Line options={options} data={chartData} />
      </div>
    </div>
  );
};

export default WellnessTracker;
