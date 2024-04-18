import {HttpParams} from '@angular/common/http';
import {ApiService} from './api.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillPaymentService {
  private resource = 'bill';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, date: any, sorteBy?: string, orderBy?: string): Observable<any> {
    const params = new HttpParams()
      .set('role', '0')
      .set('search', search)
      .set('date', date)
      .set('sortedBy', sorteBy || 'date_competence')
      .set('orderBy', orderBy || 'date_competence');

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
}
