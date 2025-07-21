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

  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      const response = await fetch('http://localhost:8000/special_memory');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMemories(data);
    } catch (error) {
      console.error("Error fetching memories:", error);
    }
  };

  const handleCardClick = (memory: Memory) => {
    setSelectedMemory(memory);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMemory(null);
  };

  const handleSave = async () => {
    if (!selectedMemory) return;
    // Implement save logic here
    console.log('Saving:', selectedMemory);
    handleCloseModal();
  };

  const handleDelete = async () => {
    if (!selectedMemory) return;
    // Implement delete logic here
    console.log('Deleting:', selectedMemory);
    handleCloseModal();
  };

  return (
    <div className="memory-lane-container">
      <div className="memory-lane-header">
        <h2>Memory Lane</h2>
        <p>A collection of your most cherished moments.</p>
      </div>
      <div className="memories-grid">
        {memories.map((memory) => (
          <div key={memory.id} className="memory-card" onClick={() => handleCardClick(memory)}>
            <h3>{memory.title}</h3>
            <p className="memory-date">{new Date(memory.timestamp).toLocaleDateString()}</p>
            <p>{memory.memory}</p>
          </div>
        ))}
      </div>

      {isModalOpen && selectedMemory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Memory</h3>
            <textarea
              value={selectedMemory.memory}
              onChange={(e) => setSelectedMemory({ ...selectedMemory, memory: e.target.value })}
            />
            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="delete-btn" onClick={handleDelete}>Delete</button>
              <button className="close-btn" onClick={handleCloseModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryLane;


