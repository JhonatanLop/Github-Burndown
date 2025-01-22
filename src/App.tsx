import { useEffect, useState } from 'react';
import getAllIssues from './services/Issues';
import getAllMilestones from './services/Milestone';
import { IssueResponse } from './interfaces/Issue';
import { MilestoneResponse } from './interfaces/Milestone';

function App() {
  const [issues, setIssues] = useState<IssueResponse[]>([]);
  const [milestones, setMilestones] = useState<MilestoneResponse[]>([]);

  useEffect(() => {
    async function fetchIssues() {
      const issues = await getAllIssues('git-project-status', 'JhonatanLop');
      console.log('Issues:', issues);
      setIssues(issues);
    }

    async function fetchMilestone() {
      const milestones = await getAllMilestones('git-project-status', 'JhonatanLop');
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
        {issues.map(issue => (
          <div key={issue.id}>{issue.title}</div>
        ))}
      </div>
      <div>
        {milestones.map(milestone => (
          <div key={milestone.number}>{milestone.title}</div>
        ))}
      </div>
    </>
  );
}


export default App;