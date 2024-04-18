import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { Observable } from "rxjs";
import { Auth } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private storageAuth: Auth;

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {
    this.storageAuth = this.storageService.getAuth();
  }

  on(url: string, body: Object, method: string, params?: HttpParams): Observable<any> {
    this.storageAuth = this.storageService.getAuth();

    if (body?.hasOwnProperty('company_id')) {
      body['company_id'] = this.storageAuth.company.id;
    }

    switch (method) {
      case 'post-token':
        return this.http.post(
          `${environment.api}/${url}?companyId=${this.storageAuth.company.id}`,
          body,
          this.getHttpHeaders()
        );
      case 'post':
        return this.http.post(`${environment.api}/${url}`, body);
      case 'post-file':
        return this.http.post(`${url}`, body);
      case 'get-token':
        return this.http.get(
          `${environment.api}/${url}?companyId=${this.storageAuth.company.id}`,
          this.getHttpHeaders()
        );
      case 'get-token-params':
        return this.http.get(`${environment.api}/${url}?companyId=${this.storageAuth.company.id}`, {
          headers: new HttpHeaders({
            Authorization: 'Bearer ' + this.storageAuth.token.token,
          }),
          params,
        });
      case 'get-no-environment':
        return this.http.get(url);
      case 'get':
        return this.http.get(`${environment.api}/${url}`);
      case 'put-token':
        return this.http.put(
          `${environment.api}/${url}?companyId=${this.storageAuth.company.id}`,
          body,
          this.getHttpHeaders()
        );
      case 'put':
        return this.http.put(`${environment.api}/${url}`, body);
      case 'delete-token':
        return this.http.delete(
          `${environment.api}/${url}?companyId=${this.storageAuth.company.id}`, this.getHttpHeaders()
        );
      default:
        return this.http.get('', body);
    }
  }

  getHttpHeaders(): any {
    return {
      headers: new HttpHeaders({
        Authorization: 'Bearer ' + this.storageService.getAuth().token.token,
      }),
    };
  }
}
