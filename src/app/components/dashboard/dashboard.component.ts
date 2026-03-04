import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IdeaService } from '../../services/idea.service';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { Idea, IdeaFormData } from '../../models/idea.model';
import { IdeaDialogComponent } from '../idea-dialog/idea-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule, IdeaDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private readonly ideaService = inject(IdeaService);
  private readonly snackbar = inject(SnackbarService);
  private readonly authService = inject(AuthService);

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly ideas = this.ideaService.paginatedIdeas;
  readonly totalItems = this.ideaService.totalItems;
  readonly pagination = this.ideaService.pagination;
  readonly totalPages = this.ideaService.totalPages;
  readonly loading = this.ideaService.loading;

  readonly activeTab = signal<'all' | 'my' | 'top'>('all');
  readonly searchInput = signal<string>('');
  readonly idSearchInput = signal<string>('');

  readonly likedIds = signal<Set<number>>(new Set());

  readonly showDialog = signal<boolean>(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly editingIdea = signal<Idea | null>(null);
  readonly dialogSubmitting = signal<boolean>(false);

  readonly paginationStart = computed(() => {
    const p = this.pagination();
    return this.totalItems() === 0 ? 0 : (p.currentPage - 1) * p.pageSize + 1;
  });

  readonly paginationEnd = computed(() => {
    const p = this.pagination();
    return Math.min(p.currentPage * p.pageSize, this.totalItems());
  });

  ngOnInit(): void {
    this.ideaService.loadIdeas();
  }

  setActiveTab(tab: 'all' | 'my' | 'top'): void {
    this.activeTab.set(tab);
  }

  onIdSearch(value: string): void {
    this.idSearchInput.set(value);
    this.ideaService.setSearchId(value);
  }

  onSearchInput(value: string): void {
    this.searchInput.set(value);
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => {
      this.ideaService.loadIdeas(value);
    }, 400);
  }

  clearFilters(): void {
    this.searchInput.set('');
    this.idSearchInput.set('');
    this.ideaService.clearSearch();
    this.ideaService.loadIdeas();
  }

  goToPage(page: number): void {
    this.ideaService.goToPage(page);
  }

  nextPage(): void {
    this.ideaService.nextPage();
  }

  previousPage(): void {
    this.ideaService.previousPage();
  }

  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.editingIdea.set(null);
    this.showDialog.set(true);
  }

  openEditDialog(idea: Idea): void {
    this.dialogMode.set('edit');
    this.editingIdea.set(idea);
    this.showDialog.set(true);
  }

  closeDialog(): void {
    this.showDialog.set(false);
    this.editingIdea.set(null);
  }

  onIdeaSubmit(formData: IdeaFormData): void {
    if (this.dialogMode() === 'create') {
      this.dialogSubmitting.set(true);
      this.ideaService.createIdea(formData).subscribe({
        next: (response) => {
          this.snackbar.showSuccess(response || 'Idea Created');
          this.dialogSubmitting.set(false);
          this.closeDialog();
          this.ideaService.loadIdeas(this.searchInput());
        },
        error: () => {
          this.dialogSubmitting.set(false);
        }
      });
    } else {
      this.closeDialog();
    }
  }

  toggleLike(ideaId: number): void {
    const isCurrentlyLiked = this.likedIds().has(ideaId);
    const isUpVote = !isCurrentlyLiked;

    this.ideaService.voteIdea(ideaId, isUpVote).subscribe({
      next: (response) => {
        this.snackbar.showSuccess(response || 'Vote Added');
        this.likedIds.update(ids => {
          const updated = new Set(ids);
          if (isUpVote) {
            updated.add(ideaId);
          } else {
            updated.delete(ideaId);
          }
          return updated;
        });
        this.ideaService.updateVoteCount(ideaId, isUpVote ? 1 : -1);
      }
    });
  }

  isLiked(ideaId: number): boolean {
    return this.likedIds().has(ideaId);
  }

  onExport(): void {
    this.ideaService.exportToExcel();
  }

  onLogout(): void {
    this.authService.logout();
  }

  trackByIdeaId(_index: number, idea: Idea): number {
    return idea.id;
  }
}
