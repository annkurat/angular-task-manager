import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  inject,
} from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { TASK_STATUSES, PRIORITIES } from '@app/shared/utils/constants';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Category, Task } from '@app/shared/utils/interfaces';
import { TaskService } from '@app/core/services/task.service';
import { CategoryService } from '@app/core/services/category.service';
import { FormGroup, FormControl } from '@angular/forms';
import { SharedModule } from '@app/shared/shared.module';
import {
  ModalComponent,
  ModalData,
} from '@app/shared/components/modal/modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { formatDate } from '@app/shared/utils/i10n';
import { InputSearchComponent } from '@app/shared/components/input-search/input-search.component';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MatDatepickerModule,
    MatNativeDateModule,
    InputSearchComponent,
  ],
})
export class TaskBoardComponent implements OnInit {
  tasks: Task[] = [];
  pageSize = 5;
  pageIndex = 0;
  totalTasks = 0;
  categories: any[] = [];
  isLoading = false;
  loadingCategories = false;
  selectedCategory: Category | null = null;
  searchInput = '';
  searchTerm = '';
  private snackBar = inject(MatSnackBar);

  statusOptions = Object.entries(TASK_STATUSES).map(([value, viewValue]) => ({
    value,
    viewValue,
  }));

  selectedStatuses: string[] = [];
  selectedCategoryId: string | null = null;

  dateRange = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  taskForm!: FormGroup;
  isEditMode = false;
  private editingTask: Task | null = null;

  priorities = Object.entries(PRIORITIES).map(([value, viewValue]) => ({
    value,
    viewValue,
  }));

  @ViewChild('taskFormFields', { static: true })
  taskFormFields!: TemplateRef<any>;

  headers = {
    title: 'Title',
    description: 'Description',
    status: 'Status',
    priority: 'Priority',
    dueDate: 'Due Date',
  };

  columnFormatters = {
    status: (value: string) => TASK_STATUSES[value] ?? value,
    priority: (value: string) => PRIORITIES[value] ?? value,
    dueDate: (value: string) => formatDate(value),
  };

  get filters(): { [key: string]: any } {
    const filters: { [key: string]: any } = {
      page: this.pageIndex + 1,
      pageSize: this.pageSize,
    };

    if (this.searchTerm) {
      filters['search'] = this.searchTerm;
    }

    if (this.dateRange.value.start) {
      filters['start'] = this.dateRange.value.start.toISOString();
    }

    if (this.dateRange.value.end) {
      filters['end'] = this.dateRange.value.end.toISOString();
    }

    if (this.selectedStatuses.length) {
      filters['status'] = this.selectedStatuses.join(',');
    }

    return filters;
  }

  constructor(
    private dialog: MatDialog,
    private taskService: TaskService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  private createTaskForm(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      dueDate: [null],
      priority: ['medium'],
      status: ['todo'],
      categoryId: [null],
    });
  }

  private openDialog(title: string, confirmText: string): void {
    const dialogRef = this.dialog.open<ModalComponent, ModalData, Task>(
      ModalComponent,
      {
        width: '600px',
        data: {
          title,
          confirmText,
          form: this.taskForm,
          fieldsTemplate: this.taskFormFields,
          isEditMode: this.isEditMode,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.isEditMode && this.editingTask?.id) {
          this.updateTask(this.editingTask.id, result);
          this.editingTask = null;
        } else {
          this.createTask(result);
        }
      } else {
        this.editingTask = null;
      }
    });
  }

  openAddTaskDialog(): void {
    this.isEditMode = false;
    this.createTaskForm();
    this.openDialog('Add New Task', 'Create');
  }

  editTask(task: Task): void {
    this.isEditMode = true;
    this.editingTask = task;
    this.taskForm = this.fb.group({
      title: [task.title, [Validators.required, Validators.minLength(3)]],
      description: [task.description],
      dueDate: [task.dueDate ? new Date(task.dueDate) : null],
      priority: [task.priority],
      status: [task.status],
      categoryId: [task.categoryId],
    });

    if (task.categoryId) {
      this.categoryService.get(task.categoryId).subscribe({
        next: (response) => {
          this.categories = response ? [response] : [];
          this.loadingCategories = false;
          this.selectedCategory = response;
        },
        error: () => {
          this.loadingCategories = false;
          this.categories = [];
        },
      });
    }

    this.openDialog('Edit Task', 'Update');
  }

  onFormCategorySelected(category: Category) {
    this.taskForm.patchValue({ categoryId: category.id });
    this.selectedCategory = category;
  }

  onFormCategoryClear() {
    this.taskForm.patchValue({ categoryId: null });
    this.selectedCategory = null;
  }

  onCategorySearch(term: string) {
    this.loadingCategories = true;
    setTimeout(() => {
      this.categoryService.getAll({ search: term, pageSize: 5 }).subscribe({
        next: (response) => {
          this.categories = response.items || [];
          this.loadingCategories = false;
        },
        error: () => {
          this.loadingCategories = false;
          this.categories = [];
        },
      });
    }, 300);
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(id).subscribe({
        next: () => {
          this.tasks = this.tasks.filter((task) => task.id !== id);
          this.loadTasks();
        },
        error: (error: any) => this.handleError('deleting task', error),
      });
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTasks();
  }

  onSearch(): void {
    this.searchTerm = this.searchInput;
    this.pageIndex = 0;
    this.isLoading = true;
    this.loadTasks();
    this.dateRange.markAsPristine();
  }

  clearFilters(): void {
    this.dateRange.reset();
    this.selectedStatuses = [];
    this.searchInput = '';
    this.searchTerm = '';
    this.pageIndex = 0;
    this.loadTasks();
    this.dateRange.markAsPristine();
  }

  private loadTasks(): void {
    this.isLoading = true;
    this.taskService.getAll(this.filters).subscribe({
      next: (response) => {
        this.tasks = response.items;
        this.totalTasks = response.total;
        this.isLoading = false;
      },
      error: (error) => this.handleError('loading tasks', error),
    });
  }

  private createTask(data: Task): void {
    this.taskService.create(data).subscribe({
      next: (newTask) => {
        this.tasks = [newTask, ...this.tasks];
        this.totalTasks++;
        this.showSuccess('Task created successfully');
      },
      error: (error: any) => this.handleError('creating task', error),
    });
  }

  private updateTask(id: string, data: Task): void {
    this.taskService.update(id, data).subscribe({
      next: (updatedTask) => {
        this.tasks = this.tasks.map((t) =>
          t.id === updatedTask.id ? updatedTask : t
        );
        this.showSuccess('Task updated successfully');
      },
      error: (error: any) => this.handleError('updating task', error),
    });
  }

  private handleError(action: string, error: any): void {
    console.error(`Error ${action}:`, error);
    this.snackBar.open(`Failed while ${action}`, 'Dismiss', {
      duration: 3000,
    });
    this.isLoading = false;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }
}
