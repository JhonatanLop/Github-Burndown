import { Octokit } from "@octokit/core";
import { IssueResponse } from "../interfaces/Issue";

const token = import.meta.env.VITE_GITHUB_TOKEN;
console.log('Token:', token);
let issuesCache: { [key: string]: IssueResponse[] } = {};

// Pega todas as issues do repositório
async function getAllIssues(gitRepo:string, gitOwner:string): Promise<IssueResponse[]> {
    const cacheKey = `${gitOwner}/${gitRepo}`;

    if (issuesCache[cacheKey]) {
        return issuesCache[cacheKey];
    }

    if (!token) {
        console.error('GITHUB_TOKEN is not set');
        return [];
    }

    try {
        const octokit = new Octokit({ auth: token });
        const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
            owner: gitOwner,
            repo: gitRepo,
            state: 'all',
            per_page: 100,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        const result = response.data as IssueResponse[];
        issuesCache[cacheKey] = result;
        return result;
    } catch (error) {
        console.error('Error fetching repository issues:', error);
        return [];
    }
};

export default getAllIssues;


// meu plano original era fazer funções diferentes para minerar cada coisa da lista
// mas para melhorar um pouco a performance, eu decidi fazer tudo em uma função só
// isso é ruim pra manutenção, mas é bom para performance
// vou precisar das seguintes informações para montar o dashboard:
// - quantidade de issues abertas na sprint
// - quantidade de issues fechadas na sprint
// - quantidade de issues em progresso na sprint
// - quantidade de issues com prioridade alta na sprint
// - quantidade de issues com prioridade média na sprint
// - quantidade de issues com prioridade baixa na sprint
