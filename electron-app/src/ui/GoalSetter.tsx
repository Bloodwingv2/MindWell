import './GoalSetter.css';

interface GoalSetterProps {
  goals: { id: string; text: string; completed: boolean }[];
  setGoals: React.Dispatch<React.SetStateAction<{ id: string; text: string; completed: boolean }[]>>;
}

const GoalSetter: React.FC<GoalSetterProps> = ({ goals, setGoals }) => {
  const handleAddGoal = () => {
    const newGoalInput = document.getElementById('newGoalInput') as HTMLInputElement;
    const goalText = newGoalInput.value.trim();
    if (goalText) {
      const newGoal = { id: Date.now().toString(), text: goalText, completed: false };
      setGoals(prev => [...prev, newGoal]);
      newGoalInput.value = '';
    }
  };

  const handleToggleGoal = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target;
    if (target.type === 'checkbox') {
      const listItem = target.closest('.goal-item-styles') as HTMLLIElement;
      if (listItem) {
        const goalId = listItem.dataset.id;
        setGoals(prev => prev.map(goal =>
          goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
        ));
      }
    }
  };

  return (
    <div className="goal-setter-content">
      <h2>Goal Setter</h2>
      <p>Set small, achievable goals to improve your well-being.</p>
      <div className="goal-input-container">
        <input type="text" id="newGoalInput" className="goal-input-field" placeholder="Enter a new goal" />
        <button id="addGoalBtn" className="goal-add-button" onClick={handleAddGoal}>Add Goal</button>
      </div>
      <ul id="goalList" className="goal-list-styles" onChange={handleToggleGoal}>
        {goals.map(goal => (
          <li key={goal.id} className={`goal-item-styles ${goal.completed ? 'goal-item-completed' : ''}`} data-id={goal.id}>
            <span className="goal-item-span">{goal.text}</span>
            <input type="checkbox" className="goal-item-checkbox" checked={goal.completed} readOnly />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GoalSetter;
