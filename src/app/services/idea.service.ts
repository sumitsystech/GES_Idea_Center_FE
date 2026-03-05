import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Idea, IdeaFormData, PaginationState } from '../models/idea.model';
import { environment } from '../../environments/environment';
import { SnackbarService } from './snackbar.service';

@Injectable({ providedIn: 'root' })
export class IdeaService {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);

  private readonly allIdeasState = signal<Idea[]>([]);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);
  private readonly searchIdState = signal<string>('');
  private readonly filterTypeState = signal<string>('');
  private readonly filterGesCenterState = signal<string>('');
  private readonly filterCreatedByState = signal<number | null>(null);
  private readonly paginationState = signal<PaginationState>({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0
  });

  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly pagination = this.paginationState.asReadonly();

  readonly filteredIdeas = computed(() => {
    let filtered = this.allIdeasState();
    const idTerm = this.searchIdState().trim();
    const typeTerm = this.filterTypeState();
    const gesCenterTerm = this.filterGesCenterState();
    const createdBy = this.filterCreatedByState();

    if (createdBy !== null) {
      filtered = filtered.filter(idea => idea.createdBy === createdBy);
    }
    if (idTerm) {
      filtered = filtered.filter(idea => idea.id.toString().includes(idTerm));
    }
    if (typeTerm) {
      filtered = filtered.filter(idea => idea.type === typeTerm);
    }
    if (gesCenterTerm) {
      filtered = filtered.filter(idea => idea.gesCenterId === gesCenterTerm);
    }
    return filtered;
  });

  readonly totalItems = computed(() => this.filteredIdeas().length);

  readonly paginatedIdeas = computed(() => {
    const page = this.paginationState();
    const start = (page.currentPage - 1) * page.pageSize;
    return this.filteredIdeas().slice(start, start + page.pageSize);
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.totalItems() / this.paginationState().pageSize) || 1
  );

  loadIdeas(search?: string): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    let params = new HttpParams();
    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }

    this.http.get<Idea[]>(`${environment.apiBaseUrl}/Idea`, { params }).subscribe({
      next: (ideas) => {
        this.allIdeasState.set(ideas);
        this.paginationState.update(p => ({
          ...p,
          currentPage: 1,
          totalItems: ideas.length
        }));
        this.loadingState.set(false);
      },
      error: (error) => {
        const message = error?.error || 'Failed to load ideas.';
        this.errorState.set(typeof message === 'string' ? message : 'Failed to load ideas.');
        this.snackbar.showError(typeof message === 'string' ? message : 'Failed to load ideas.');
        this.loadingState.set(false);
      }
    });
  }

  setSearchId(id: string): void {
    this.searchIdState.set(id);
    this.paginationState.update(p => ({ ...p, currentPage: 1 }));
  }

  setFilterType(type: string): void {
    this.filterTypeState.set(type);
    this.paginationState.update(p => ({ ...p, currentPage: 1 }));
  }

  setFilterCreatedBy(userId: number | null): void {
    this.filterCreatedByState.set(userId);
    this.paginationState.update(p => ({ ...p, currentPage: 1 }));
  }

  setFilterGesCenter(gesCenter: string): void {
    this.filterGesCenterState.set(gesCenter);
    this.paginationState.update(p => ({ ...p, currentPage: 1 }));
  }

  clearSearch(): void {
    this.searchIdState.set('');
    this.filterTypeState.set('');
    this.filterGesCenterState.set('');
    this.filterCreatedByState.set(null);
    this.paginationState.update(p => ({ ...p, currentPage: 1 }));
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

  exportToExcel(): void {
    this.http.get(`${environment.apiBaseUrl}/Idea/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'ideas-export.xlsx';
        anchor.click();
        URL.revokeObjectURL(url);
      },
      error: (error) => {
        const message = error?.error || 'Failed to export ideas.';
        this.snackbar.showError(typeof message === 'string' ? message : 'Failed to export ideas.');
      }
    });
  }

  voteIdea(ideaId: number, isUpVote: boolean): Observable<string> {
    return this.http.post(`${environment.apiBaseUrl}/Idea/vote`, { ideaId, isUpVote }, { responseType: 'text' }).pipe(
      catchError(error => {
        const message = error?.error || 'Failed to vote. Please try again.';
        this.snackbar.showError(typeof message === 'string' ? message : 'Failed to vote.');
        return throwError(() => error);
      })
    );
  }

  updateVoteCount(ideaId: number, delta: number): void {
    this.allIdeasState.update(ideas =>
      ideas.map(idea =>
        idea.id === ideaId ? { ...idea, votes: idea.votes + delta } : idea
      )
    );
  }

  updateIdea(id: number, formData: IdeaFormData): Observable<string> {
    const body = {
      id,
      title: formData.ideaTitle,
      type: formData.ideaType,
      description: formData.description,
      gesCenterId: formData.gesCenter,
      contributorId: formData.contributeOnBehalfOf,
      coContributors: formData.coContributors
    };

    return this.http.put(`${environment.apiBaseUrl}/Idea/update/${id}`, body, { responseType: 'text' }).pipe(
      catchError(error => {
        const message = error?.error || 'Failed to update idea. Please try again.';
        this.snackbar.showError(typeof message === 'string' ? message : 'Failed to update idea.');
        return throwError(() => error);
      })
    );
  }

  createIdea(formData: IdeaFormData): Observable<string> {
    const body = new FormData();
    body.append('Title', formData.ideaTitle);
    body.append('Type', formData.ideaType);
    body.append('Description', formData.description);
    body.append('GESCenterId', formData.gesCenter);
    body.append('ContributorId', formData.contributeOnBehalfOf);
    body.append('CoContributors', formData.coContributors);
    body.append('AttachmentPath', '');
    if (formData.file) {
      body.append('file', formData.file, formData.file.name);
    }

    return this.http.post(`${environment.apiBaseUrl}/Idea`, body, { responseType: 'text' }).pipe(
      catchError(error => {
        const message = error?.error || 'Failed to create idea. Please try again.';
        this.snackbar.showError(typeof message === 'string' ? message : 'Failed to create idea.');
        return throwError(() => error);
      })
    );
  }
}
