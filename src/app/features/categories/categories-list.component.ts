import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedModule } from '@app/shared/shared.module';
import { CategoryService } from '@app/core/services/category.service';
import { TaskService } from '@app/core/services/task.service';
import { Category } from '@app/shared/utils/interfaces';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { TableComponent } from '@app/shared/components/table/table.component';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    TableComponent,
    ModalComponent,
  ],
  providers: [CategoryService, DatePipe],
})
export class CategoriesListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private categoryService = inject(CategoryService);
  private taskService = inject(TaskService);

  @ViewChild('categoryFormFields', { static: true })
  categoryFormFields!: TemplateRef<any>;

  categoryForm!: FormGroup;
  isEditMode = false;

  categories: Category[] = [];
  filteredCategories: Category[] = [];
  totalItems = 0;
  isLoading = false;
  isLoadingTasks = false;
  searchInput = '';
  searchTerm = '';
  pageIndex = 0;
  pageSize = 5;
  lastSearchTerm = '';

  headers = {
    title: 'Title',
    description: 'Description',
    tasks: 'Tasks',
  };

  columnFormatters = {
    tasks: (tasks: any[]) => tasks.map((t) => t.title).join(', '),
  };

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  initForm(category?: Category): void {
    this.categoryForm = this.fb.group({
      title: [
        category?.title || '',
        [Validators.required, Validators.minLength(3)],
      ],
      description: [category?.description || ''],
      tasks: [category?.tasks || []],
    });
    this.isEditMode = !!category;
  }

  openDialog(title: string, confirmText: string, onConfirm: () => void): void {
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '600px',
      data: {
        title,
        form: this.categoryForm,
        fieldsTemplate: this.categoryFormFields,
        confirmText,
        cancelText: 'Cancel',
        isEditMode: this.isEditMode,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) onConfirm();
    });
  }

  openAddDialog(): void {
    this.initForm();
    this.openDialog('Add Category', 'Add', () =>
      this.createCategory(this.categoryForm.value)
    );
  }

  editCategory(category: Category): void {
    this.initForm(category);
    this.openDialog('Edit Category', 'Update', () =>
      this.updateCategory(category.id, this.categoryForm.value)
    );
  }

  createCategory(data: Category): void {
    this.toggleLoading(true);
    this.categoryService.create(this.formatData(data)).subscribe({
      next: (newCategory) => {
        this.categories.unshift(newCategory);
        this.filteredCategories = [...this.categories];
        this.totalItems++;
        this.showMessage('Category created successfully');
      },
      error: (err) => this.handleError('create', err),
    });
  }

  updateCategory(id: string, data: Category): void {
    this.toggleLoading(true);
    this.categoryService.update(id, this.formatData(data)).subscribe({
      next: (updatedCategory) => {
        const index = this.categories.findIndex((c) => c.id === id);
        if (index !== -1) this.categories[index] = updatedCategory;
        this.filteredCategories = [...this.categories];
        this.showMessage('Category updated successfully');
      },
      error: (err) => this.handleError('update', err),
    });
  }

  deleteCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.toggleLoading(true);
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.categories = this.categories.filter((c) => c.id !== id);
        this.filteredCategories = [...this.categories];
        this.totalItems--;
        this.showMessage('Category deleted successfully');
      },
      error: (err) => this.handleError('delete', err),
    });
  }

  loadCategories(): void {
    this.toggleLoading(true);
    this.categoryService
      .getAll({
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        search: this.searchTerm,
      })
      .subscribe({
        next: (res) => {
          this.categories = res.items;
          this.filteredCategories = [...this.categories];
          this.totalItems = res.total;
          this.toggleLoading(false);
        },
        error: (err) => this.handleError('load', err),
      });
  }

  clearFilters(): void {
    if (this.searchInput || this.pageIndex !== 0) {
      this.searchInput = '';
      this.searchTerm = '';
      this.pageIndex = 0;
      this.lastSearchTerm = '';
      this.loadCategories();
    }
  }

  onSearch(): void {
    this.searchTerm = this.searchInput;
    this.pageIndex = 0;
    this.lastSearchTerm = this.searchTerm;
    this.isLoading = true;
    this.loadCategories();
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadCategories();
  }

  onTaskSearch(term: string): void {
    this.isLoadingTasks = true;
    this.taskService.getAll({ search: term, limit: 5 }).subscribe({
      next: () => {
        this.isLoadingTasks = false;
      },
      error: () => (this.isLoadingTasks = false),
    });
  }

  private formatData(data: Category): Category {
    return {
      ...data,
      tasks: this.categoryForm.get('tasks')?.value || [],
    };
  }

  private toggleLoading(state: boolean): void {
    this.isLoading = state;
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Dismiss', { duration: 3000 });
    this.toggleLoading(false);
  }

  private handleError(action: string, error: any): void {
    console.error(`Error during ${action}:`, error);
    this.snackBar.open(`Failed to ${action} category`, 'Dismiss', {
      duration: 3000,
    });
    this.toggleLoading(false);
  }
}
