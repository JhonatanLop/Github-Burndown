import { Octokit } from "@octokit/core";
import { IssueResponse } from "../interfaces/Issue";

const token = import.meta.env.VITE_GITHUB_TOKEN;
let issuesCache: { [key: string]: IssueResponse[] } = {};

// Pega todas as issues/pull requests do repositório
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

        // cacheia o resultado
        const result = response.data as IssueResponse[];
        issuesCache[cacheKey] = result;
        return result;
    } catch (error) {
        console.error('Error fetching repository issues:', error);
        return [];
    }
};

export default getAllIssues;

