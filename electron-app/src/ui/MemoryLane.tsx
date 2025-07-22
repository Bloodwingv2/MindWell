import { useEffect, useState } from 'react';
import './MemoryLane.css';

interface Memory {
  id: number;
  title: string;
  memory: string;
  timestamp: string;
}

const MemoryLane: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch('http://localhost:8000/special_memory');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      
      // Simulate loading for smooth entrance animation
      setTimeout(() => {
        setMemories(data);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching memories:", error);
      setIsLoading(false);
    }
  };

  const handleCardClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMemory(null), 300);
  };

  const handleSave = async () => {
    if (!selectedMemory) return;
    console.log('Saving:', selectedMemory);
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (!selectedMemory) return;
    console.log('Deleting:', selectedMemory);
    handleCloseModal();
  };

  if (isLoading) {
    return (
      <div className="memory-lane-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your memories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="memory-lane-container">
      <div className={`memory-lane-header ${!isLoading ? 'fade-in' : ''}`}>
        <h2>Memory Lane</h2>
        <p>A collection of your most cherished moments.</p>
      </div>
      
      <div className="memories-grid">
        {memories.map((memory, index) => (
          <div 
            key={memory.id} 
            className="memory-card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => handleCardClick(memory)}
          >
            <div className="card-content">
              <h3>{memory.title}</h3>
              <p className="memory-date">{new Date(memory.timestamp).toLocaleDateString()}</p>
              <p className="memory-text">{memory.memory}</p>
            </div>
            <div className="card-glow"></div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div 
          className={`modal-overlay ${isModalOpen ? 'modal-enter' : 'modal-exit'}`}
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className={`modal-content ${isModalOpen ? 'modal-content-enter' : 'modal-content-exit'}`}>
            <div className="modal-header">
              <h3>Edit Memory</h3>
              <button 
                className="modal-close-x"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="input-group">
                <label>Title</label>
                <input
                  type="text"
                  value={selectedMemory?.title || ''}
                  onChange={(e) => setSelectedMemory(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              
              <div className="input-group">
                <label>Memory</label>
                <textarea
                  value={selectedMemory?.memory || ''}
                  onChange={(e) => setSelectedMemory(prev => prev ? { ...prev, memory: e.target.value } : null)}
                  placeholder="Share your precious memory..."
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="action-btn save-btn" onClick={handleSave}>
                <span className="btn-icon">💾</span>
                Save
              </button>
              <button className="action-btn delete-btn" onClick={handleDelete}>
                <span className="btn-icon">🗑️</span>
                Delete
              </button>
              <button className="action-btn close-btn" onClick={handleCloseModal}>
                <span className="btn-icon">✕</span>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryLane;
