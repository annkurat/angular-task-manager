import { Routes } from '@angular/router';
import { TaskBoardComponent } from './features/tasks/tasks-list.component';
import { CategoriesListComponent } from './features/categories/categories-list.component';

export const routes: Routes = [
  {
    path: '',
    component: TaskBoardComponent,
  },
  {
    path: 'categories',
    component: CategoriesListComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
