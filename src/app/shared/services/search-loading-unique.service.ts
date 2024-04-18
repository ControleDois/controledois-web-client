import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchLoadingUniqueService {
  constructor(
    private apiService: ApiService
  ) { }

  index(url: string, search: string, sorteBy?: string, orderBy?: string, page?: number, limit?: number, paramsArray?: any): Observable<any> {
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

    return this.apiService.on(url, '', 'get-token-params', params);
  }
}
