import { Component, ChangeDetectionStrategy, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { Idea, IdeaFormData } from '../../models/idea.model';

@Component({
  selector: 'app-idea-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule],
  templateUrl: './idea-dialog.component.html',
  styleUrl: './idea-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaDialogComponent implements OnInit {
  readonly mode = input.required<'create' | 'edit'>();
  readonly idea = input<Idea | null>(null);

  readonly closeDialog = output<void>();
  readonly submitIdea = output<IdeaFormData>();

  readonly isEditMode = computed(() => this.mode() === 'edit');

  readonly formData = signal<IdeaFormData>({
    ideaTitle: '',
    ideaType: '',
    description: '',
    gesCenter: '',
    contributeOnBehalfOf: '',
    coContributors: ''
  });

  readonly ideaTypeOptions = [
    'Process Improvement',
    'New Product',
    'Cost Reduction',
    'Safety Enhancement',
    'Customer Experience',
    'Technology Innovation'
  ];

  readonly gesCenterOptions = ['Pune', 'Chennai', 'Bangalore', 'Shanghai', 'Phoenix'];

  ngOnInit(): void {
    const currentIdea = this.idea();
    if (this.mode() === 'edit' && currentIdea) {
      this.formData.set({
        ideaTitle: currentIdea.title,
        ideaType: currentIdea.category,
        description: '',
        gesCenter: currentIdea.gesCenter,
        contributeOnBehalfOf: '',
        coContributors: ''
      });
    }
  }

  updateField(field: keyof IdeaFormData, value: string): void {
    this.formData.update(current => ({ ...current, [field]: value }));
  }

  onClose(): void {
    this.closeDialog.emit();
  }

  onReset(): void {
    if (this.mode() === 'edit') {
      this.ngOnInit();
    } else {
      this.formData.set({
        ideaTitle: '',
        ideaType: '',
        description: '',
        gesCenter: '',
        contributeOnBehalfOf: '',
        coContributors: ''
      });
    }
  }

  onSubmit(): void {
    this.submitIdea.emit(this.formData());
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.onClose();
    }
  }
}
