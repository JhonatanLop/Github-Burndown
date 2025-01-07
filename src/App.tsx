import { useEffect, useState } from 'react';
import getAllIssues from './services/Issues';
import { Issue } from './interfaces/Issue';

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function fetchIssues() {
      const issues = await getAllIssues('git-project-status', 'JhonatanLop');
      console.log('Issues:', issues);
      setIssues(issues);
    }

    fetchIssues();
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
    </>
  );
}


export default App;