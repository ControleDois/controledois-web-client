import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private resource = 'company';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, sorteBy?: string, orderBy?: string, page?: string, limit?: string): Observable<any> {
    const params = new HttpParams()
      .set('search', search)
      .set('sortedBy', sorteBy || 'name')
      .set('orderBy', orderBy || 'name')
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

  select(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/select/${id}`, '', 'get-token');
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
