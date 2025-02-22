import { useEffect, useState } from 'react';
import getIssues from './services/Issues';
import { getMilestones, getSprintDays } from './services/Milestone';
import { Issue } from './interfaces/Issue';
import { Milestone } from './interfaces/Milestone';
import Burndown from './components/Burndown';
import './App.css';

function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Milestone>();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [days, setDays] = useState<string[]>();

  useEffect(() => {
    async function fetchData() {
      const milestones = await getMilestones();
      setMilestones(milestones);

      const selected = milestones[milestones.length - 1];
      setSelectedSprint(selected);

      const days = getSprintDays(selected);
      setDays(days);

      const myIssues = await getIssues(selected.title);
      setIssues(myIssues);

      // console.log('Milestones:', milestones);
      // console.log('Selected Sprint:', selected);
      // console.log('Days:', days);
      // console.log('Issues:', myIssues);
    }

    fetchData();
  }, []);

  const handleSprintChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sprintTitle = event.target.value;
    const sprint = milestones.find(milestone => milestone.title === sprintTitle);
    if (sprint) {
      setSelectedSprint(sprint);

      const days = getSprintDays(sprint);
      setDays(days);

      const myIssues = await getIssues(sprint.title);
      setIssues(myIssues);
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