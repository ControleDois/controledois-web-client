import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NfeManifestService {
  private resource = 'manifest';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, date: any, sorteBy?: string, orderBy?: string, page?: string, limit?: string): Observable<any> {
    const params = new HttpParams()
      .set('role', '1')
      .set('search', search)
      .set('date', date)
      .set('sortedBy', sorteBy || 'id')
      .set('orderBy', orderBy || 'id')
      .set('page', page || '1')
      .set('limit', limit || '10');

    return this.apiService.on(this.resource, '', 'get-token-params', params);
  }
}
