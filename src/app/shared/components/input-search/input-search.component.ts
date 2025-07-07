import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export interface SearchableItem {
  id: string | number;
  title: string;
  [key: string]: any;
}

@Component({
  selector: 'app-input-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss'],
})
export class InputSearchComponent<T extends SearchableItem>
  implements OnInit, OnChanges
{
  @Input() label: string = 'Search';
  @Input() placeholder: string = 'Type to search...';
  @Input() set items(value: T[]) {
    this._items = value || [];
  }
  @Input() loading: boolean = false;
  @Input() set selectedItem(item: T | null) {
    if (item) {
      this._selectedItem = item;
      this.searchControl.setValue(item.title, { emitEvent: false });
    } else {
      this._selectedItem = null;
      this.searchControl.setValue('', { emitEvent: false });
    }
  }
  @Output() search = new EventEmitter<string>();
  @Output() selected = new EventEmitter<T>();
  @Output() cleared = new EventEmitter<void>();

  searchControl = new FormControl('');
  _items: T[] = [];
  isFocused = false;
  private _selectedItem: T | null = null;
  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']?.currentValue) {
      this._items = changes['items'].currentValue;
    }
  }

  ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) => {
        if (typeof value === 'string') {
          this.search.emit(value);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFocus() {
    this.isFocused = true;
    if (this.searchControl.value === '') {
      this.search.emit('');
    }
  }

  onBlur() {
    this.isFocused = false;
  }

  onSelectItem(item: T) {
    this._selectedItem = item;
    this.selected.emit(item);
    this.searchControl.setValue(item.title, { emitEvent: false });
  }

  clear() {
    this.searchControl.setValue('');
    this._selectedItem = null;
    this.cleared.emit();
    this.search.emit('');
  }
}
