import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Task, PaginatedResponse } from '@app/shared/utils/interfaces';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getAll(filter?: {
    [key: string]: string | number;
  }): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();

    if (filter) {
      const {
        page = 1,
        pageSize = 5,
        search = '',
        status = '',
        priority = '',
        start,
        end,
      } = filter;

      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());

      if (search) params = params.set('search', search);
      if (status) params = params.set('status', status);
      if (priority) params = params.set('priority', priority);
      if (start) params = params.set('start', start.toString());
      if (end) params = params.set('end', end.toString());
    }

    return this.http.get<PaginatedResponse<Task>>(this.apiUrl, { params });
  }

  create(task: Omit<Task, 'id'>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, task);
  }

  update(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, task);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
