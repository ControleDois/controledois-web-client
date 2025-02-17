import {HttpParams} from '@angular/common/http';
import {ApiService} from './api.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private apiService: ApiService
  ) {
  }

  receviementAndPayment(): Observable<any> {
    return this.apiService.on('dashReceviementAndPayment', '', 'get-token');
  }

  banksAccounts(): Observable<any> {
    return this.apiService.on('banksAccounts', '', 'get-token');
  }

  cashFlow(): Observable<any> {
    return this.apiService.on('cashFlow', '', 'get-token');
  }

  backups(role: string): Observable<any> {
    let params = new HttpParams()
      .set('role', role)

    return this.apiService.on('backups', '','get-token-params', params);
  }
}
