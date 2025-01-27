import { useEffect, useState } from 'react';
import getAllIssues from './services/Issues';
import getAllMilestones from './services/Milestone';
import { Issue } from './interfaces/Issue';
import { Milestone } from './interfaces/Milestone';

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
      async function fetchIssues() {
        const issues = await getAllIssues();
        console.log('Issues:', issues);
        setIssues(issues);
      }

      async function fetchMilestone() {
        const milestones = await getAllMilestones();
        console.log('Milestones:', milestones);
        setMilestones(milestones);
      }
      fetchIssues();
      fetchMilestone();
    }, []);

  return (
    <>
      <div>
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
      </div>
    </>
  );
}


export default App;