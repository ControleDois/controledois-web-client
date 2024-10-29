import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private resource = 'config';

  constructor(private apiService: ApiService) {}

  show(): Observable<any> {
    return this.apiService.on(`${this.resource}`, '', 'get-token');
  }

  update(id: string, body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, body, 'put-token');
  }

  save(id: string, body: Object): Observable<any> {
    return this.update(id, body);
  }

  whatsappConnect(id: string): Observable<any> {
    return this.apiService.on(`https://whatsapp.ctrix.com.br/session/${id}`, '', 'get-no-environment');
  }
}
