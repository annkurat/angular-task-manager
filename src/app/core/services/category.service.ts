import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Category, PaginatedResponse } from '@app/shared/utils/interfaces';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(filter?: {
    [key: string]: string | number;
  }): Observable<PaginatedResponse<Category>> {
    let params = new HttpParams();

    if (filter) {
      const { page = 1, pageSize = 10, search = '' } = filter;

      params = params
        .set('page', page.toString())
        .set('pageSize', pageSize.toString());

      if (search) {
        params = params.set('search', search);
      }
    }

    return this.http.get<PaginatedResponse<Category>>(this.apiUrl, { params });
  }

  get(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  create(category: Omit<Category, 'id'>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  update(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, category);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
