import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mode } from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class NFeService {
  private resource = 'nfe';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, date: any, modelo: string, sorteBy?: string, orderBy?: string, page?: string, limit?: string): Observable<any> {
    let params = new HttpParams()
      .set('search', search)
      .set('date', date)
      .set('modelo', modelo)
      .set('sortedBy', sorteBy || 'id')
      .set('orderBy', orderBy || 'id')
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

  send(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/send/${id}`, '', 'post-token');
  }

  searchStatus(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/status/${id}`, '', 'get-token');
  }

  cancel(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/cancel/${id}`, '', 'post-token');
  }

  syncPDV(body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/sync-pdv`, body, 'post-token');
  }
}
