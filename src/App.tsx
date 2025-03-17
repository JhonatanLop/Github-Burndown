import { useEffect, useState } from 'react';
import { getIssues, getPrediction, getDone} from './services/Issues';
import { getMilestones, getSprintDays } from './services/Milestone';
import { Milestone } from './interfaces/Milestone';
import Burndown from './components/Burndown';
import './App.css';

function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Milestone>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    function updateDimensions() {
      const width = window.innerWidth * 0.93;
      const height = window.innerHeight * 0.88;
      console.log(window.innerWidth,window.innerHeight);
      console.log(width,height);
      setDimensions({ width, height });
    }

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      const milestones = await getMilestones();
      setMilestones(milestones);

      const sprint = milestones[milestones.length - 1];
      await updateSprint(sprint);
    }

    fetchData();
  }, []);

  const handleSprintChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sprintTitle = event.target.value;
    const sprint = milestones.find(milestone => milestone.title === sprintTitle);
    if (sprint) {
      await updateSprint(sprint);
    }
  };

  async function updateSprint(sprint: Milestone) {
    sprint.days = getSprintDays(sprint);
    sprint.issues = await getIssues(sprint.title);
    sprint.predicted = getPrediction(sprint.issues, sprint.days.length);
    sprint.done = getDone(sprint.issues, sprint.days);
    setSelectedSprint(sprint);
  }
  return (
    <>
      <header>
        <h1 className='title'>
          Dashboard Khali
        </h1>
        <div className='config'>
          <select value={selectedSprint?.title || ''} onChange={handleSprintChange}>
            {milestones.map(milestone => (
              <option key={milestone.number} value={milestone.title}>
                {milestone.title}
              </option>
            ))}
          </select>
        </div>
      </header>
      <main>
        <div className='conteiner'>
            <Burndown 
              days={selectedSprint ? selectedSprint.days : ['']}
              predicted={selectedSprint ? selectedSprint.predicted : []}
              done={selectedSprint ? selectedSprint.done : []}
              width={dimensions.width}
              height={dimensions.height}
            />
          </div>
      </main>
    </>
  );
}


export default App;