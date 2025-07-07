import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class TableComponent<T extends { id: string }> {
  @Input() title = '';
  @Input() get allColumns(): string[] {
    return [...this.displayedColumns, ...(this.showActions ? ['actions'] : [])];
  }

  formatCellValue(column: string, value: any): string {
    const formatter = this.columnFormatters[column];
    return formatter ? formatter(value) : value ?? '';
  }

  @Input() items: T[] = [];
  @Input() headers: { [key: string]: string } = {};

  get displayedColumns(): string[] {
    return Object.keys(this.headers);
  }

  @Input() columnFormatters: { [key: string]: (value: any) => string } = {};
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() totalItems = 0;
  @Input() pageIndex = 0;
  @Input() showSearch = false;
  @Input() showActions = true;
  @Input() searchPlaceholder = 'Search';

  @Output() add = new EventEmitter<void>();
  @Output() edit = new EventEmitter<T>();
  @Output() delete = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<{
    pageIndex: number;
    pageSize: number;
  }>();

  searchControl = new FormControl('');
  private searchSubscription: Subscription = new Subscription();

  ngOnInit() {
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value: string | null) => {
        this.search.emit(value || '');
      });
  }

  onAddClick() {
    this.add.emit();
  }

  onEditClick(item: T) {
    this.edit.emit(item);
  }

  onDeleteClick(id: string) {
    this.delete.emit(id);
  }

  onPageChange(event: any) {
    this.pageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
    });
  }

  ngOnDestroy() {
    this.searchSubscription.unsubscribe();
  }
}
