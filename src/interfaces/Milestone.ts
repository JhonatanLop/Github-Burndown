export interface Milestone {
    title: string;
    start_on: string; // start 3 weeks before due_on (3 weeks sprint model by fatec)
    due_on: string;
    number: number;
}

export interface MilestoneResponse {
    title: string;
    due_on: string;
    number: number;
}