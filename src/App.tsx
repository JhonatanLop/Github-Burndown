import { useEffect, useState } from 'react';
import { getIssues, getPrediction, getDone} from './services/Issues';
import { getMilestones, getSprintDays } from './services/Milestone';
import { Milestone } from './interfaces/Milestone';
import Burndown from './components/Burndown';
import './App.css';

function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Milestone>();

  useEffect(() => {
    async function fetchData() {
      const milestones = await getMilestones();
      setMilestones(milestones);

      const sprint = milestones[milestones.length - 1];
      await updateSprint(sprint);

      // console.log('Milestones:', milestones);
      // console.log('Selected Sprint:', sprint);
      // console.log('Days:', sprint.days);
      // console.log('Issues:', sprint.issues);
    }

    fetchData();
  }, []);

  const handleSprintChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sprintTitle = event.target.value;
    const sprint = milestones.find(milestone => milestone.title === sprintTitle);
    if (sprint) {
      await updateSprint(sprint);
      // console.log('Selected Sprint:', sprint);
      // console.log('Days:', sprint.days);
      // console.log('Issues:', sprint.issues);
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
          <div className='burndown'>
            <Burndown days={selectedSprint ? selectedSprint.days : ['']} predicted={selectedSprint ? selectedSprint.predicted : []} done={selectedSprint ? selectedSprint.done : []} />
          </div>
        </div>
      </main>
    </>
  );
}


export default App;