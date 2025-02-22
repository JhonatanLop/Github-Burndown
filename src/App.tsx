import { useEffect, useState } from 'react';
import getIssues from './services/Issues';
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
      sprint.days = getSprintDays(sprint);
      sprint.issues = await getIssues(sprint.title);
      setSelectedSprint(sprint);

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
      sprint.days = getSprintDays(sprint);
      
      sprint.issues = await getIssues(sprint.title);
      
      setSelectedSprint(sprint);
      // console.log('Selected Sprint:', sprint);
      // console.log('Days:', sprint.days);
      // console.log('Issues:', sprint.issues);
    }
  };

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
            <Burndown days={["01", "02", "03", "04", "05"]} predicted={[12, 6, 3, 1, 0]} done={[12, 10, 8, 6]} />
          </div>
        </div>
      </main>
    </>
  );
}


export default App;