import { Octokit } from "@octokit/core";
import { Milestone, MilestoneResponse } from "../interfaces/Milestone";

let milestonesCache: { [key: string]: Milestone[] } = {};

async function fetchingAllMilestones(gitRepo:string, gitOwner:string): Promise<Milestone[]> {
    console.log(gitRepo);
    
    const gitRepos = gitRepo.split(',');
    const cacheKey = `${gitOwner}/${gitRepo}`;
    
    if (milestonesCache[cacheKey]) {
        return milestonesCache[cacheKey];
    }

    try {
        // Pega todas as milestones do repositório
        const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });
        const response = await octokit.request('GET /repos/{owner}/{repo}/milestones', {
            owner: gitOwner,
            repo: gitRepos[0],
            per_page: 100,
            state: 'all',
            headers: {
              'X-GitHub-Api-Version': '2022-11-28'
            }
        })
        const result = response.data as MilestoneResponse[];

        // Transforma o resultado em um array do tipo Milestone
        // Na resposta da requisição as milestones não tem a data de início
        // O tipo Milestone tem a data de início 3 semanas antes da data de entrega
        const milestones = result.map((milestone) => {
            const start_on = new Date(milestone.due_on);
            start_on.setDate(start_on.getDate() - 21);

            return {
                title: milestone.title,
                start_on: start_on.toISOString(),
                due_on: milestone.due_on,
                number: milestone.number
            } as Milestone;
        });

        // cacheia o resultado
        milestonesCache[cacheKey] = milestones;
        return milestones;
    } catch (error) {
        console.error('Error fetching repository milestones:', error);
        return [];
    }
};

function getSprintDays(sprint:Milestone): string[] {
    const start = new Date(sprint.start_on);
    const end = new Date(sprint.due_on);
    const days = [];
    for (let i = start; i <= end; i.setDate(i.getDate() + 1)) {
        days.push(new Date(i).toISOString().split('T')[0]);
    }
    return days;
}

function getMilestones(): Promise<Milestone[]> {
    return fetchingAllMilestones(import.meta.env.VITE_GIT_REPO as string, import.meta.env.VITE_GIT_OWNER as string);
}

// export default getMilestones;
export { getMilestones, getSprintDays };