import { useEffect, useState } from 'react';
import getIssues from './services/Issues';
import getAllMilestones from './services/Milestone';
import { Issue } from './interfaces/Issue';
import { Milestone } from './interfaces/Milestone';
import Burndown from './components/Burndown';
import './App.css';

function App() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function fetchMilestone() {
      const milestones = await getAllMilestones();
      setMilestones(milestones);
      setSelectedSprint(milestones[milestones.length-1].title);
    }
    
    fetchMilestone();
  }, []);

  useEffect(() => {
    if (selectedSprint) {
      async function fetchIssues() {
        setIssues(await getIssues(selectedSprint));
      }

      fetchIssues();
    }
  }, [selectedSprint]);

  const handleSprintChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sprint = event.target.value;
    setSelectedSprint(sprint);
  };

  return (
    <>
      <header>
        <h1 className='title'>
          Dashboard Khali
        </h1>
        <div className='config'>
          <select value={selectedSprint} onChange={handleSprintChange}>
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
            <Burndown labels={["01", "02", "03", "04", "05"]} distribution={[12, 6, 3, 1, 0]} points={[12, 10, 8, 6, 3]} />
          </div>
        </div>
      </main>
      {/* <div>
        Iniciando projeto
      </div>
      <div>
        <h2>Issues:</h2>
        {issues.map(issue => (
          <div key={issue.id}>{issue.title}</div>
        ))}
      </div>
      <br></br>
      <div>
        <h2>Milestones:</h2>
        {milestones.map(milestone => (
          <div key={milestone.number}>{milestone.title}</div>
        ))}
      </div> */}
    </>
  );
}


export default App;