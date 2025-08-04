import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private resource = 'dialog';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, sorteBy?: string, orderBy?: string, page?: string, limit?: string, paramsArray?: any): Observable<any> {
    let params = new HttpParams()
      .set('search', search)
      .set('sortedBy', sorteBy || 'name')
      .set('orderBy', orderBy || 'name')
      .set('page', page || '1')
      .set('limit', limit || '10');

    if (paramsArray && paramsArray.length > 0) {
      for (const data of paramsArray) {
        params = params.set(data.param, data.value);
      }
    }

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

  startDialog(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}/start-dialog`, '', 'post-token-no-company');
  }

  disconsiderDialog(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}/disconsider-dialog`, '', 'post-token-no-company');
  }

  sendMessage(id: string, body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}/send-message`, body, 'post-token-no-company');
  }
}
