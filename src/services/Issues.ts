import { Octokit } from "@octokit/core";
import { IssueResponse, Issue } from "../interfaces/Issue";
import { PullRequest } from "../interfaces/PullRequests";

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

// Função responsável por dividir as Issues dos Pull Requests
// Um dicionário de Issues e uma lista de Pull Requests
function splitIssuesAndPullRequests(issues: IssueResponse[]) {
    const result: { issues: { [key: string]: Issue }, pullRequests: PullRequest[] } = {
        issues: {},
        pullRequests: []
    };

    issues.forEach(issueResp => {
        // se node_id começa com "I" é uma issue
        if (issueResp.node_id.startsWith('I')) {
            const issue: Issue = {
                id: issueResp.id,
                title: issueResp.title,
                state: issueResp.state === 'open' ? 1 : issueResp.state === 'closed' ? 2 : 0,
                created_at: issueResp.created_at,
                closed_at: issueResp.closed_at,
                html_url: issueResp.html_url,
                sprint: issueResp.milestone?.title || ''
            };
            result.issues[issue.id] = issue;
        }
        // se não, é um pull request
        else {
            const pr: PullRequest = {
                id: issueResp.id,
                title: issueResp.title,
                body: issueResp.body,
                state: issueResp.state
            }
            result.pullRequests.push(pr);
        }
    }); 
    return result 
};

// Função que passa por todos os pullrequests e corrige o estado da issue
function fixIssueState(pullRequests: PullRequest[], issues: { [key: string]: Issue }) {
    pullRequests.forEach(pr => {
        // verifica as issues indexadas no body do pull request
        const issueIds = pr.body.match(/#\d+/g);
        if (!issueIds) {
            return;
        }
        issueIds.forEach(issueId => {
            const id = issueId.substring(1);
            const issue = issues[id];
            if (issue) {
                // se o pull request está aberto, a issue está em revisão
                if (pr.state === 'open') {
                    issue.state = 3;
                }
                // se o pull request está fechado, a issue está feita
                else {
                    issue.state = 4;
                }
            }
        });
    });
};

export default getAllIssues;

