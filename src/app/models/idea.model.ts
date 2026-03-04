export interface Idea {
  readonly id: number;
  readonly title: string;
  readonly type: string;
  readonly description: string;
  readonly gesCenterId: string;
  readonly contributorId: string;
  readonly coContributors: string;
  readonly votes: number;
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
  file: File | null;
}

export interface IdeaDialogConfig {
  readonly mode: 'create' | 'edit';
  readonly idea?: Idea;
}
