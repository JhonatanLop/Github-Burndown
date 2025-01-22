import { Octokit } from "@octokit/core";
import { Milestone, MilestoneResponse } from "../interfaces/Milestone";

const token = import.meta.env.VITE_GITHUB_TOKEN;
let milestonesCache: { [key: string]: MilestoneResponse[] } = {};

async function getAllMilestones(gitRepo:string, gitOwner:string): Promise<MilestoneResponse[]> {
    const cacheKey = `${gitOwner}/${gitRepo}`;
    
    if (milestonesCache[cacheKey]) {
        return milestonesCache[cacheKey];
    }

    try {
        // Pega todas as milestones do repositório
        const octokit = new Octokit({ auth: token });
        const response = await octokit.request('GET /repos/{owner}/{repo}/milestones', {
            owner: gitOwner,
            repo: gitRepo,
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

export default getAllMilestones;