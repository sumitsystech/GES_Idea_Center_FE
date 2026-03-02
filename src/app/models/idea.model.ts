export interface Idea {
  readonly id: number;
  readonly title: string;
  readonly owner: string;
  readonly submittedDate: string;
  readonly votes: number;
  readonly status: string;
  readonly category: string;
  readonly gesCenter: string;
}

export type StatusFilter = 'All' | 'Not Approved' | 'Approved' | 'Under Review' | 'Implemented';

export interface PaginationState {
  readonly currentPage: number;
  readonly pageSize: number;
  readonly totalItems: number;
}

export interface IdeaFormData {
  ideaTitle: string;
  ideaType: string;
  description: string;
  gesCenter: string;
  contributeOnBehalfOf: string;
  coContributors: string;
}

export interface IdeaDialogConfig {
  readonly mode: 'create' | 'edit';
  readonly idea?: Idea;
}
