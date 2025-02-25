import { Octokit } from "@octokit/core";
import { IssueResponse, Issue } from "../interfaces/Issue";
import { PullRequest } from "../interfaces/PullRequests";

let issuesCache: { [key: string]: IssueResponse[] } = {};

// Pega todas as issues/pull requests do repositório
async function fetchingAllIssues(gitRepo: string, gitOwner: string): Promise<IssueResponse[]> {
    const gitRepos = gitRepo.split(',');
    const cacheKey = `${gitOwner}/${gitRepo}`;

    if (issuesCache[cacheKey]) {
        return issuesCache[cacheKey];
    }

    if (!import.meta.env.VITE_GITHUB_TOKEN) {
        console.error('Authentication failed. Please provide a valid GitHub token.');
        return [];
    }

    try {
        const octokit = new Octokit({ auth: import.meta.env.VITE_GITHUB_TOKEN });
        const promises = gitRepos.map(async repo => {
            const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
                owner: gitOwner,
                repo: repo,
                state: 'all',
                per_page: 100,
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            return response.data as IssueResponse[];
        });

        const results = await Promise.all(promises);
        const flattenedResults = results.flat();
        issuesCache[cacheKey] = flattenedResults;
        return flattenedResults;
    } catch (error) {
        console.error('Error fetching repository issues:', error);
        return [];
    }
}

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
            const issueId: number = +(issueResp.html_url.split('/').pop() || 0);
            const issue: Issue = {
                id: issueId,
                title: issueResp.title,
                state: issueResp.state === 'open' ? 1 : issueResp.state === 'closed' ? 2 : 0,
                created_at: new Date(issueResp.created_at).toISOString().split('T')[0],
                closed_at: issueResp.closed_at ? new Date(issueResp.closed_at).toISOString().split('T')[0] : '',
                html_url: issueResp.html_url,
                sprint: issueResp.milestone?.title || '',
                priority: 0
            };

            // verifica as labels da issue para definir a prioridade
            for (const label of issueResp.labels) {
                if (label.name === 'low') {
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
function fixIssueState(pullRequests: PullRequest[], issues: { [key: string]: Issue }): Issue[] {
    //ordernar os prs de data mais antiga para mais recente
    const issuesArray: Issue[] = [];
    pullRequests.forEach(pr => {
        // verifica as issues indexadas no body do pull request
        const issueIds = pr.body.match(/- resolve #\d+/g)?.map(match => match.match(/\d+/)[0]);
        if (!issueIds) {
            return;
        }
        issueIds.forEach(issueId => {
            const id: number = +issueId;
            const issue = issues[id];
            if (issue) {
                // se o pull request está aberto, a issue está em revisão
                if (pr.state && issue.state === 1 || issue.state === 3) {
                    issue.state = 3;
                }
                // se o pull request está fechado, a issue está feita
                else {
                    issue.state = 4;
                }
            }
            issuesArray.push(issue);
        });
    });
    return issuesArray;
};

function getIssues(sprint: string): Promise<Issue[]> {
    let issuesFromGithub = fetchingAllIssues(import.meta.env.VITE_GIT_REPO as string, import.meta.env.VITE_GIT_OWNER as string);

    // Filtra as issues do sprint selecionado
    issuesFromGithub = issuesFromGithub.then((issues) => {
        return issues.filter(issue => issue.milestone?.title == sprint);
    });

    return issuesFromGithub.then((issues) => {
        const { issues: issuesDict, pullRequests } = splitIssuesAndPullRequests(issues);
        fixIssueState(pullRequests, issuesDict);
        return Object.values(issuesDict);
    });
}

function getPrediction(issues: Issue[], days: number): number[] {
    const totalPriority = issues.reduce((acc, issue) => acc + issue.priority, 0);
    const prediction = [];
    const distribution = (totalPriority / days);
    for (let i = 0; i < days; i++) {
        prediction.push(totalPriority - (distribution * i));
    }
    return prediction;
}

function getDone(issues: Issue[], days: string[]): number[] {
    const done: number[] = [];

    // ordenação dos arrays
    issues.sort((a, b) => a.closed_at.localeCompare(b.closed_at));
    // days.sort((a, b) => a.localeCompare(b));

    // pontos totais
    let allPoints = issues.reduce((acc, issue) => acc + issue.priority, 0);

    // mapeamento dos pontos queimados por dia
    const pointsBurnedPerDay = new Map<string, number>();
    issues.forEach(issue => {
        if (issue.state === 4) {
            pointsBurnedPerDay.set(issue.closed_at, (pointsBurnedPerDay.get(issue.closed_at) || 0) + issue.priority);
        }
    });

    // Calcula os pontos restantes para cada dia
    days.forEach((day, i) => {
        if (new Date(day) > new Date()) {
            return;
        }
        const pointsBurned = pointsBurnedPerDay.get(day) || 0;
        allPoints -= pointsBurned;
        done[i] = allPoints;
    });
    return done;
}

export { getIssues, getPrediction, getDone };