import { Injectable, signal, computed } from '@angular/core';
import { Idea, PaginationState, StatusFilter } from '../models/idea.model';

@Injectable({ providedIn: 'root' })
export class IdeaService {
  private readonly ideasState = signal<Idea[]>(MOCK_IDEAS);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);
  private readonly statusFilterState = signal<StatusFilter>('Not Approved');
  private readonly searchIdState = signal<string>('');
  private readonly paginationState = signal<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: MOCK_IDEAS.length
  });

  readonly ideas = this.ideasState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly statusFilter = this.statusFilterState.asReadonly();
  readonly searchId = this.searchIdState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();

  readonly filteredIdeas = computed(() => {
    let filtered = this.ideasState();
    const status = this.statusFilterState();
    const id = this.searchIdState();

    if (status !== 'All') {
      filtered = filtered.filter(idea => idea.status === status);
    }
    if (id) {
      filtered = filtered.filter(idea => idea.id.toString().includes(id));
    }
    return filtered;
  });

  readonly totalFilteredItems = computed(() => this.filteredIdeas().length);

  readonly paginatedIdeas = computed(() => {
    const page = this.paginationState();
    const start = (page.currentPage - 1) * page.pageSize;
    return this.filteredIdeas().slice(start, start + page.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.totalFilteredItems() / this.paginationState().pageSize)
  );

  setStatusFilter(status: StatusFilter): void {
    this.statusFilterState.set(status);
    this.resetToFirstPage();
  }

  setSearchId(id: string): void {
    this.searchIdState.set(id);
    this.resetToFirstPage();
  }

  goToPage(page: number): void {
    const total = this.totalPages();
    if (page >= 1 && page <= total) {
      this.paginationState.update(p => ({ ...p, currentPage: page }));
    }
  }

  nextPage(): void {
    this.goToPage(this.paginationState().currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.paginationState().currentPage - 1);
  }

  private resetToFirstPage(): void {
    this.paginationState.update(p => ({ ...p, currentPage: 1 }));
  }
}

const MOCK_IDEAS: Idea[] = [
  {
    id: 542,
    title: 'I/O Mapping in ControlEdge Builder: Integrating Channel Assignment into the EC Programming Workspace',
    owner: 'Swapnil Shirke',
    submittedDate: '19/02/2026 14:31',
    votes: 2,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 541,
    title: 'SafeView configuration Tool',
    owner: 'Vidya D Mujumale',
    submittedDate: '14/01/2026 20:36',
    votes: 2,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 540,
    title: 'HMI – Web display builder shall have a Simple static-Table addition option.',
    owner: 'Vidya D Mujumale',
    submittedDate: '14/01/2026 14:38',
    votes: 0,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 539,
    title: 'Interlock should have AUTO update of upstream based on input connection',
    owner: 'Shruti Satish Dalvi',
    submittedDate: '11/12/2025 17:45',
    votes: 0,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 538,
    title: 'Accelerated Migration and Expansion with Experion Flex & Console Station VM Templates for Enabled Services Customers',
    owner: 'Arun Raj Nagarajan',
    submittedDate: '09/12/2025 23:58',
    votes: 0,
    status: 'Not Approved',
    category: 'Services',
    gesCenter: 'Chennai'
  },
  {
    id: 537,
    title: 'Automatic Experion Patch installation on New Machines',
    owner: 'Subramonian Veerappan',
    submittedDate: '04/12/2025 03:32',
    votes: 1,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Chennai'
  },
  {
    id: 536,
    title: 'New tool for compatibility matrix',
    owner: 'Harishkein Panneer Selvam',
    submittedDate: '26/11/2025 04:05',
    votes: 0,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Chennai'
  },
  {
    id: 535,
    title: 'Enhancement of Controller Migration',
    owner: 'Harishkein Panneer Selvam',
    submittedDate: '26/11/2025 03:36',
    votes: 2,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Chennai'
  },
  {
    id: 534,
    title: 'Enhancement of orderitem position',
    owner: 'Harishkein Panneer Selvam',
    submittedDate: '26/11/2025 02:57',
    votes: 0,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Chennai'
  },
  {
    id: 533,
    title: 'Enhancement of CAB Block propagation',
    owner: 'Harishkein Panneer Selvam',
    submittedDate: '26/11/2025 02:40',
    votes: 1,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Chennai'
  },
  {
    id: 532,
    title: 'SharePoint-Driven Review and Approval for Project Deliverables',
    owner: 'Guruswant Patil',
    submittedDate: '16/11/2025 05:00',
    votes: 1,
    status: 'Not Approved',
    category: 'Services',
    gesCenter: 'Pune'
  },
  {
    id: 531,
    title: 'Automated Regression Testing Framework',
    owner: 'Rajesh Kumar',
    submittedDate: '10/11/2025 10:20',
    votes: 3,
    status: 'Approved',
    category: 'Engineering',
    gesCenter: 'Bangalore'
  },
  {
    id: 530,
    title: 'Cloud-Based Monitoring Dashboard',
    owner: 'Priya Sharma',
    submittedDate: '05/11/2025 08:15',
    votes: 5,
    status: 'Approved',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 529,
    title: 'AI-Powered Predictive Maintenance Module',
    owner: 'Vikram Singh',
    submittedDate: '01/11/2025 14:30',
    votes: 4,
    status: 'Under Review',
    category: 'Innovation',
    gesCenter: 'Chennai'
  },
  {
    id: 528,
    title: 'Unified API Gateway for Microservices',
    owner: 'Meena Iyer',
    submittedDate: '28/10/2025 09:45',
    votes: 2,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Bangalore'
  },
  {
    id: 527,
    title: 'Real-time Data Streaming Pipeline',
    owner: 'Arjun Patel',
    submittedDate: '25/10/2025 16:00',
    votes: 1,
    status: 'Implemented',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 526,
    title: 'Containerized Deployment Strategy',
    owner: 'Deepa Nair',
    submittedDate: '20/10/2025 11:30',
    votes: 6,
    status: 'Approved',
    category: 'DevOps',
    gesCenter: 'Chennai'
  },
  {
    id: 525,
    title: 'Automated Code Quality Gate',
    owner: 'Suresh Menon',
    submittedDate: '15/10/2025 13:00',
    votes: 0,
    status: 'Not Approved',
    category: 'Engineering',
    gesCenter: 'Pune'
  },
  {
    id: 524,
    title: 'Cross-Platform Mobile Application Framework',
    owner: 'Kavita Reddy',
    submittedDate: '10/10/2025 07:45',
    votes: 3,
    status: 'Under Review',
    category: 'Engineering',
    gesCenter: 'Bangalore'
  }
];
