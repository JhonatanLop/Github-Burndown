import { Label } from "./Labels";
import { MilestoneResponse } from "./Milestone";

export interface Issue {
    id: number;
    title: string;
    state: number; // 1=open; 2=closed; 3=review; 4=done
    created_at: string;
    closed_at: string;
    html_url: string;
    sprint: string; // sprint será o titulo do milestone
}

export interface IssueResponse {
    id: number;
    title: string;
    body: string;
    state: string;
    assignee: null;
    created_at: string;
    closed_at: string;
    html_url: string;
    milestone: MilestoneResponse;
    labels: Label[];
    node_id: string;
}