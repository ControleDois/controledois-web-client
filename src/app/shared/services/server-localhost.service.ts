import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerLocalhostService {
  constructor(
    private apiService: ApiService
  ) { }

  printSalePDV(token: string, body: Object): Observable<any> {
    return this.apiService.on(`http://localhost:9000/print?token=${token}`, body, 'post-no-environment');
  }
}
