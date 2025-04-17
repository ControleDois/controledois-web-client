import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeopleService {
  private resource = 'people';

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

  cnpj(cnpj: string): Observable<any> {
    const url = "https://publica.cnpj.ws/cnpj/";
    return this.apiService.on(`${url}${cnpj}`, '', 'get-no-environment');
  }

  cep(cep: string): Observable<any> {
    const url = "https://viacep.com.br/ws/";
    return this.apiService.on(`${url}${cep}/json/`, '', 'get-no-environment');
  }
}
