import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { IdeaService } from '../../services/idea.service';
import { Idea, IdeaFormData, StatusFilter } from '../../models/idea.model';
import { IdeaDialogComponent } from '../idea-dialog/idea-dialog.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule, IdeaDialogComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private readonly ideaService = inject(IdeaService);

  readonly ideas = this.ideaService.paginatedIdeas;
  readonly totalFiltered = this.ideaService.totalFilteredItems;
  readonly pagination = this.ideaService.pagination;
  readonly totalPages = this.ideaService.totalPages;
  readonly loading = this.ideaService.loading;
  readonly statusFilter = this.ideaService.statusFilter;

  readonly activeTab = signal<'all' | 'my' | 'top'>('all');
  readonly idSearch = signal<string>('');
  readonly statusFilterInput = signal<StatusFilter>('Not Approved');
  readonly titleSearch = signal<string>('');
  readonly categorySearch = signal<string>('');
  readonly gesCenterSearch = signal<string>('');

  readonly statusOptions: StatusFilter[] = ['All', 'Not Approved', 'Approved', 'Under Review', 'Implemented'];

  readonly gesCenterOptions = ['All', 'Pune', 'Chennai', 'Bangalore'];

  readonly selectedGesCenter = signal<string>('All');

  readonly showDialog = signal<boolean>(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly editingIdea = signal<Idea | null>(null);

  readonly paginationStart = computed(() => {
    const p = this.pagination();
    return this.totalFiltered() === 0 ? 0 : (p.currentPage - 1) * p.pageSize + 1;
  });

  readonly paginationEnd = computed(() => {
    const p = this.pagination();
    return Math.min(p.currentPage * p.pageSize, this.totalFiltered());
  });

  setActiveTab(tab: 'all' | 'my' | 'top'): void {
    this.activeTab.set(tab);
  }

  onStatusFilterChange(status: StatusFilter): void {
    this.statusFilterInput.set(status);
    this.ideaService.setStatusFilter(status);
  }

  onIdSearch(id: string): void {
    this.idSearch.set(id);
    this.ideaService.setSearchId(id);
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

  onIdeaSubmit(_formData: IdeaFormData): void {
    this.closeDialog();
  }

  trackByIdeaId(_index: number, idea: { id: number }): number {
    return idea.id;
  }
}
