import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskBoardService {
  private resource = 'task-board';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, status?: number, sorteBy?: string, orderBy?: string, page?: string, limit?: string): Observable<any> {
    const params = new HttpParams()
      .set('search', search)
      .set('status', status || '0')
      .set('sortedBy', sorteBy || 'title')
      .set('orderBy', orderBy || 'title')
      .set('page', page || '1')
      .set('limit', limit || '10');

    return this.apiService.on(this.resource, '', 'get-token-params', params);
  }

  store(body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}`, body, 'post-token');
  }

  show(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, '', 'get-token');
  }

  update(id: string, body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, body, 'put-token');
  }

  destroy(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, '', 'delete-token');
  }

  save(id: string, body: Object): Observable<any> {
    return id === 'new' ? this.store(body) : this.update(id, body);
  }

  upload(body: Object): Observable<any> {
    return this.apiService.on(`task-files`, body, 'post-token');
  }
}
