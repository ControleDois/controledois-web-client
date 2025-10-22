import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  updateTerminal(id: string, body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/terminal/${id}`, body, 'put-token');
  }

  whatsappConnect(id: string): Observable<any> {
    return this.apiService.on(`${environment.whatsapp}/session/${id}`, '', 'get-no-environment');
  }
}
