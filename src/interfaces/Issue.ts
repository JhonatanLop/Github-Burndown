import { labels } from "./Labels";

export interface Issue {
    id: number;
    title: string;
    state: string;
    created_at: string;
    closed_at: string;
    html_url: string;
    milestone: null;
    have_pr: boolean;
}

export interface IssueResponse {
    id: number;
    title: string;
    state: string;
    assignee: null;
    created_at: string;
    closed_at: string;
    html_url: string;
    milestone: null;
    labels: labels[];
    node_id: string;
}