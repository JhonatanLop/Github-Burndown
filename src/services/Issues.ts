import { Octokit } from "@octokit/core";
import { IssueResponse, Issue } from "../interfaces/Issue";
import { PullRequest } from "../interfaces/PullRequests";

const token = import.meta.env.VITE_GITHUB_TOKEN;
let issuesCache: { [key: string]: IssueResponse[] } = {};

// Pega todas as issues/pull requests do repositório
async function fetchingAllIssues(gitRepo:string, gitOwner:string): Promise<IssueResponse[]> {
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

// Função responsável por dividir as Issues e Pull Requests
// Retorna um dicionário de Issues e um array de Pull Requests
function splitIssuesAndPullRequests(issues: IssueResponse[]): { issues: { [key: string]: Issue }, pullRequests: PullRequest[] } {
    const result: { issues: { [key: string]: Issue }, pullRequests: PullRequest[] } = {
        issues: {},
        pullRequests: []
    };

    issues.forEach(issueResp => {
        // se node_id começa com "I" é uma issue
        if (issueResp.node_id.startsWith('I')) {
            // "https://github.com/JhonatanLop/git-project-status/issues/1"
            // issue id é o ultimo número da url
            const issueId : number = +(issueResp.html_url.split('/').pop());
            const issue: Issue = {
                id: issueId,
                title: issueResp.title,
                state: issueResp.state === 'open' ? 1 : issueResp.state === 'closed' ? 2 : 0,
                created_at: issueResp.created_at,
                closed_at: issueResp.closed_at,
                html_url: issueResp.html_url,
                sprint: issueResp.milestone?.title || '',
                priority: 0
            };
            
            // verifica as labels da issue para definir a prioridade
            for (const label of issueResp.labels) {
                if (label.name === 'Low') {
                    issue.priority = 1;
                } else if (label.name === 'medium') {
                    issue.priority = 2;
                } else if (label.name === 'high') {
                    issue.priority = 3;
                }
            };
            result.issues[issue.id] = issue;
        }
        // se não, é um pull request
        else {
            const pr: PullRequest = {
                id: issueResp.id,
                title: issueResp.title,
                body: issueResp.body,
                state: issueResp.state,
            }
            result.pullRequests.push(pr);
        }
    }); 
    return result 
};

// Função que passa por todos os pull requests e corrige o estado da issue
function fixIssueState(pullRequests: PullRequest[], issues: { [key: string]: Issue }): Issue[]{
    //ordernar os prs de data mais antiga para mais recente
    // pullRequests.sort((a, b) => new Date(a.create_at).getTime() - new Date(b.create_at).getTime());
    const issuesArray: Issue[] = [];
    pullRequests.forEach(pr => {
        // verifica as issues indexadas no body do pull request
        const issueIds = pr.body.match(/- resolve #\d+/g)?.map(match => match.match(/\d+/)[0]);
        if (!issueIds) {
            return;
        }
        issueIds.forEach(issueId => {
            const id : number = +issueId;
            const issue = issues[id];
            if (issue) {
                // se o pull request está aberto, a issue está em revisão
                if (pr.state && issue.state === 1 || issue.state === 3) {
                    issue.state = 3;
                }
                // se o pull request está fechado, a issue está feita
                else  {
                    issue.state = 4;
                }
            }
            issuesArray.push(issue);
        });
    });
    return issuesArray;
};

function getIssues() {
    let issuesFromGithub = fetchingAllIssues(import.meta.env.VITE_GIT_REPO as string, import.meta.env.VITE_GIT_OWNER as string);
    return issuesFromGithub.then((issues) => {
        const { issues: issuesDict, pullRequests } = splitIssuesAndPullRequests(issues);
        fixIssueState(pullRequests, issuesDict);
        return Object.values(issuesDict);
    });
    // return issuesFromGithub;
}
export default getIssues;